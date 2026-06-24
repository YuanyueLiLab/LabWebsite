(function () {
  var STORAGE_KEY = "li-lab-page-transition";
  var TRANSITION_MS = 520;
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !document.body) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {}

    root.classList.remove("is-page-entering", "is-page-leaving");
    return;
  }

  root.classList.add("page-transition-enabled");

  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) === "true" || root.classList.contains("is-page-entering")) {
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

  document.addEventListener("click", function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest("a") : null;

    if (!link || !shouldTransition(event, link)) {
      return;
    }

    event.preventDefault();
    root.classList.add("is-page-leaving");

    try {
      window.sessionStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      // Navigation should still continue if storage is unavailable.
    }

    window.setTimeout(function () {
      window.location.href = link.href;
    }, TRANSITION_MS);
  });

  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
      root.classList.remove("is-page-entering", "is-page-leaving");
    }
  });
})();
