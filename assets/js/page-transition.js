(function () {
  var STORAGE_KEY = "li-lab-page-transition";
  var TRANSITION_MS = 520;
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isNavigating = false;

  if (!document.body) {
    return;
  }

  if (prefersReducedMotion) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {}

    root.classList.remove("is-page-entering", "is-page-leaving");
  }

  if (!prefersReducedMotion) {
    root.classList.add("page-transition-enabled");
  }

  try {
    if (!prefersReducedMotion && (window.sessionStorage.getItem(STORAGE_KEY) === "true" || root.classList.contains("is-page-entering"))) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      root.classList.add("is-page-entering");

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          root.classList.remove("is-page-entering");
        });
      });
    }
  } catch (error) {
    root.classList.remove("is-page-entering");
  }

  function isSamePageHash(url) {
    return (
      url.origin === window.location.origin &&
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    );
  }

  function isLikelyDocumentOrAsset(url) {
    return /\.(?:avif|bib|csv|docx?|gif|jpe?g|json|pdf|png|pptx?|svg|tsv|txt|webp|xlsx?|zip)$/i.test(url.pathname);
  }

  function shouldTransition(event, link) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute("download")
    ) {
      return false;
    }

    var href = link.getAttribute("href");

    if (!href || href.charAt(0) === "#") {
      return false;
    }

    var url;

    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return false;
    }

    if (
      url.origin !== window.location.origin ||
      url.protocol !== window.location.protocol ||
      /^(?:mailto|tel|javascript):$/i.test(url.protocol) ||
      url.href === window.location.href ||
      isSamePageHash(url) ||
      isLikelyDocumentOrAsset(url)
    ) {
      return false;
    }

    return true;
  }

  function getPageParts(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var header = doc.querySelector("[data-site-header]");
    var main = doc.querySelector("main");

    if (!main) {
      return null;
    }

    return {
      bodyClass: doc.body ? doc.body.className : "",
      description: doc.querySelector('meta[name="description"]'),
      header: header,
      main: main,
      title: doc.title
    };
  }

  function runPageInitializers() {
    if (typeof window.initSiteNav === "function") {
      window.initSiteNav();
    }

    if (typeof window.initHomeSlides === "function") {
      window.initHomeSlides();
    }
  }

  function runPageCleanups() {
    var callbacks = window.__pageCleanupCallbacks || [];

    window.__pageCleanupCallbacks = [];

    for (var index = callbacks.length - 1; index >= 0; index -= 1) {
      try {
        callbacks[index]();
      } catch (error) {
        // A failed optional cleanup must not prevent navigation.
      }
    }

    ["destroyHomeSlides", "destroySiteNav"].forEach(function (cleanupName) {
      if (typeof window[cleanupName] === "function") {
        window[cleanupName]();
      }
    });
  }

  function runEmbeddedScripts(container) {
    var scripts = container.querySelectorAll("script");

    scripts.forEach(function (script) {
      var runnableScript = document.createElement("script");

      Array.prototype.forEach.call(script.attributes, function (attribute) {
        runnableScript.setAttribute(attribute.name, attribute.value);
      });

      runnableScript.text = script.text;
      script.replaceWith(runnableScript);
    });
  }

  function finishEnter() {
    if (prefersReducedMotion) {
      root.classList.remove("is-page-entering", "is-page-leaving");
      isNavigating = false;
      return;
    }

    root.classList.add("is-page-entering");
    root.classList.remove("is-page-leaving");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        root.classList.remove("is-page-entering");
        isNavigating = false;
      });
    });
  }

  function updatePage(parts, url, shouldPush) {
    var currentHeader = document.querySelector("[data-site-header]");
    var currentMain = document.querySelector("main");
    var description = document.querySelector('meta[name="description"]');

    if (!currentMain) {
      window.location.href = url.href;
      return;
    }

    runPageCleanups();
    document.body.className = parts.bodyClass;

    if (parts.title) {
      document.title = parts.title;
    }

    if (description && parts.description) {
      description.setAttribute("content", parts.description.getAttribute("content") || "");
    }

    if (currentHeader && parts.header) {
      currentHeader.replaceWith(parts.header);
    }

    currentMain.replaceWith(parts.main);
    runEmbeddedScripts(parts.main);

    if (shouldPush) {
      window.history.pushState({ pageTransition: true }, "", url.href);
    }

    window.scrollTo(0, 0);
    parts.main.scrollTop = 0;
    runPageInitializers();
    finishEnter();
  }

  function fetchPage(url, shouldPush) {
    return window.fetch(url.href, {
      credentials: "same-origin",
      headers: {
        "X-Requested-With": "fetch"
      }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Page request failed");
      }

      return response.text();
    }).then(function (html) {
      var parts = getPageParts(html);

      if (!parts) {
        throw new Error("Page markup missing main content");
      }

      updatePage(parts, url, shouldPush);
    });
  }

  function navigateTo(url, shouldPush) {
    if (isNavigating) {
      return;
    }

    isNavigating = true;
    if (!prefersReducedMotion) {
      root.classList.add("is-page-leaving");
    }

    window.setTimeout(function () {
      fetchPage(url, shouldPush).catch(function () {
        try {
          window.sessionStorage.setItem(STORAGE_KEY, "true");
        } catch (error) {
          // Navigation should still continue if storage is unavailable.
        }

        window.location.href = url.href;
      });
    }, prefersReducedMotion ? 0 : TRANSITION_MS);
  }

  document.addEventListener("click", function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest("a") : null;

    if (!link || !shouldTransition(event, link)) {
      return;
    }

    event.preventDefault();
    navigateTo(new URL(link.href), true);
  });

  window.addEventListener("popstate", function () {
    navigateTo(new URL(window.location.href), false);
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      root.classList.remove("is-page-entering", "is-page-leaving");
      isNavigating = false;
    }
  });
})();
