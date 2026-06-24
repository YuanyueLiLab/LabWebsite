(function () {
  var field = document.querySelector(".sky-stars");

  if (!field || typeof window.Sky !== "function") {
    return;
  }

  var existingSky = document.getElementById("sky");

  if (existingSky) {
    existingSky.remove();
  }

  var sky = new window.Sky(4, 6);
  var skyNode = document.getElementById("sky");

  if (!skyNode) {
    return;
  }

  field.appendChild(skyNode);

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sky.followPointer(0.008);
    sky.flyForward(120, 92);
  }
})();
