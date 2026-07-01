function initSiteNav() {
  var header = document.querySelector("[data-site-header]");

  if (!header || header.dataset.siteNavReady === "true") {
    return;
  }

  header.dataset.siteNavReady = "true";

  var toggle = header.querySelector("[data-nav-toggle]");
  var nav = header.querySelector("[data-site-nav]");

  if (!toggle || !nav) {
    return;
  }

  function setOpen(isOpen) {
    header.classList.toggle("is-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("is-nav-open"));
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 761px)").matches) {
      setOpen(false);
    }
  });
}

window.initSiteNav = initSiteNav;
initSiteNav();
