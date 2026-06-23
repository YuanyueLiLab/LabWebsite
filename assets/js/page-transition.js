(function () {
  var body = document.body;

  if (!body || !body.classList.contains("is-home")) {
    return;
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    var link = event.target.closest("a[href]");

    if (!link || link.target || link.hasAttribute("download")) {
      return;
    }

    var destination = new URL(link.href, window.location.href);

    if (destination.origin !== window.location.origin || destination.href === window.location.href) {
      return;
    }

    event.preventDefault();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.location.href = destination.href;
      return;
    }

    body.classList.add("is-leaving-home");

    window.setTimeout(function () {
      window.location.href = destination.href;
    }, 420);
  });
})();
