(function () {
  var field = document.querySelector(".sky-stars");

  if (!field || typeof window.Sky !== "function") {
    return;
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createMeteor() {
    var meteor = document.createElement("span");
    var angle = randomBetween(128, 148);
    var travel = randomBetween(100, 300);
    var radians = angle * Math.PI / 180;

    meteor.className = "sky-meteor";
    meteor.style.setProperty("--meteor-x", randomBetween(18, 96) + "vw");
    meteor.style.setProperty("--meteor-y", randomBetween(4, 42) + "vh");
    meteor.style.setProperty("--meteor-length", randomBetween(30, 60) + "px");
    meteor.style.setProperty("--meteor-angle", angle + "deg");
    meteor.style.setProperty("--meteor-duration", randomBetween(1200, 2400) + "ms");
    meteor.style.setProperty("--meteor-travel-x", Math.cos(radians) * travel + "px");
    meteor.style.setProperty("--meteor-travel-y", Math.sin(radians) * travel + "px");

    meteor.addEventListener("animationend", function () {
      meteor.remove();
    });

    field.appendChild(meteor);
  }

  function scheduleMeteor() {
    window.setTimeout(function () {
      createMeteor();
      scheduleMeteor();
    }, randomBetween(5000, 14000));
  }

  if (!prefersReducedMotion) {
    sky.followPointer(0.008);
    sky.flyForward(120, 92);
    window.setTimeout(createMeteor, randomBetween(1200, 3600));
    scheduleMeteor();
  }
})();
