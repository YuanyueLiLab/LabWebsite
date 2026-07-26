function initSiteNav() {
  if (typeof window.destroySiteNav === "function") {
    window.destroySiteNav();
  }

  var header = document.querySelector("[data-site-header]");

  if (!header) {
    return;
  }

  header.dataset.siteNavReady = "true";

  var toggle = header.querySelector("[data-nav-toggle]");
  var nav = header.querySelector("[data-site-nav]");
  var desktopMedia = window.matchMedia("(min-width: 761px)");
  var destroyed = false;

  if (!toggle || !nav) {
    return;
  }

  function setOpen(isOpen) {
    header.classList.toggle("is-nav-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function handleToggleClick() {
    setOpen(!header.classList.contains("is-nav-open"));
  }

  function handleNavClick(event) {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  function handleDesktopChange(event) {
    if (event.matches) {
      setOpen(false);
    }
  }

  function destroySiteNav() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    toggle.removeEventListener("click", handleToggleClick);
    nav.removeEventListener("click", handleNavClick);
    document.removeEventListener("keydown", handleKeydown);

    if (typeof desktopMedia.removeEventListener === "function") {
      desktopMedia.removeEventListener("change", handleDesktopChange);
    } else {
      desktopMedia.removeListener(handleDesktopChange);
    }

    header.dataset.siteNavReady = "false";

    if (window.destroySiteNav === destroySiteNav) {
      window.destroySiteNav = null;
    }

    header = null;
    toggle = null;
    nav = null;
    desktopMedia = null;
  }

  toggle.addEventListener("click", handleToggleClick);
  nav.addEventListener("click", handleNavClick);
  document.addEventListener("keydown", handleKeydown);

  if (typeof desktopMedia.addEventListener === "function") {
    desktopMedia.addEventListener("change", handleDesktopChange);
  } else {
    desktopMedia.addListener(handleDesktopChange);
  }

  window.destroySiteNav = destroySiteNav;
}

window.initSiteNav = initSiteNav;
initSiteNav();
