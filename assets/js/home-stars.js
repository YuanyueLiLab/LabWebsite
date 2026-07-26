(function () {
  if (typeof window.destroyHomeStars === "function") {
    window.destroyHomeStars();
  }

  var field = document.querySelector(".sky-stars");

  if (!field || typeof window.Sky !== "function") {
    return;
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  var compactViewport = window.matchMedia("(max-width: 760px)").matches;
  var constrainedDevice = (
    compactViewport ||
    Boolean(connection && connection.saveData) ||
    Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  );
  var skyLayers = prefersReducedMotion ? 1 : (constrainedDevice ? 2 : 4);
  var skyDensity = prefersReducedMotion ? 2 : (constrainedDevice ? 3 : 6);
  var activeMeteors = [];
  var destroyed = false;
  var meteorTimer = null;
  var firstMeteorTimer = null;

  var existingSky = document.getElementById("sky");

  if (existingSky) {
    if (existingSky.__skyController && typeof existingSky.__skyController.destroy === "function") {
      existingSky.__skyController.destroy();
    } else {
      existingSky.remove();
    }
  }

  var sky = new window.Sky(skyLayers, skyDensity);
  var skyNode = document.getElementById("sky");

  if (!skyNode) {
    sky.destroy();
    return;
  }

  field.appendChild(skyNode);

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function createMeteor() {
    if (destroyed || document.hidden) {
      return;
    }

    var meteor = document.createElement("span");
    var angle = randomBetween(128, 148);
    var duration = randomBetween(1200, 2400);
    var travel = randomBetween(100, 300);
    var radians = angle * Math.PI / 180;
    var meteorRecord = {
      node: meteor,
      timer: null
    };

    meteor.className = "sky-meteor";
    meteor.style.setProperty("--meteor-x", randomBetween(18, 96) + "vw");
    meteor.style.setProperty("--meteor-y", randomBetween(4, 42) + "vh");
    meteor.style.setProperty("--meteor-length", randomBetween(30, 60) + "px");
    meteor.style.setProperty("--meteor-angle", angle + "deg");
    meteor.style.setProperty("--meteor-duration", duration + "ms");
    meteor.style.setProperty("--meteor-travel-x", Math.cos(radians) * travel + "px");
    meteor.style.setProperty("--meteor-travel-y", Math.sin(radians) * travel + "px");

    meteorRecord.remove = function () {
      var recordIndex = activeMeteors.indexOf(meteorRecord);

      if (recordIndex !== -1) {
        activeMeteors.splice(recordIndex, 1);
      }

      window.clearTimeout(meteorRecord.timer);
      meteor.removeEventListener("animationend", meteorRecord.remove);
      meteor.remove();
    };

    activeMeteors.push(meteorRecord);
    meteor.addEventListener("animationend", meteorRecord.remove);
    field.appendChild(meteor);
    meteorRecord.timer = window.setTimeout(meteorRecord.remove, duration + 250);
  }

  function scheduleMeteor() {
    window.clearTimeout(meteorTimer);

    if (destroyed || document.hidden) {
      meteorTimer = null;
      return;
    }

    meteorTimer = window.setTimeout(function () {
      createMeteor();
      scheduleMeteor();
    }, randomBetween(5000, 14000));
  }

  function scheduleFirstMeteor() {
    window.clearTimeout(firstMeteorTimer);

    if (destroyed || document.hidden) {
      firstMeteorTimer = null;
      return;
    }

    firstMeteorTimer = window.setTimeout(createMeteor, randomBetween(1200, 3600));
  }

  function clearMeteors() {
    while (activeMeteors.length) {
      activeMeteors[activeMeteors.length - 1].remove();
    }

    if (field) {
      field.querySelectorAll(".sky-meteor").forEach(function (meteor) {
        meteor.remove();
      });
    }
  }

  function handleVisibilityChange() {
    if (destroyed) {
      return;
    }

    if (document.hidden) {
      sky.setPaused(true);
      window.clearTimeout(firstMeteorTimer);
      window.clearTimeout(meteorTimer);
      firstMeteorTimer = null;
      meteorTimer = null;
      clearMeteors();
      return;
    }

    sky.setPaused(false);
    scheduleFirstMeteor();
    scheduleMeteor();
  }

  function destroyHomeStars() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    window.clearTimeout(firstMeteorTimer);
    window.clearTimeout(meteorTimer);
    firstMeteorTimer = null;
    meteorTimer = null;
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clearMeteors();
    sky.destroy();

    if (window.destroyHomeStars === destroyHomeStars) {
      window.destroyHomeStars = null;
    }

    sky = null;
    skyNode = null;
    field = null;
  }

  window.destroyHomeStars = destroyHomeStars;

  if (!prefersReducedMotion) {
    if (!constrainedDevice) {
      sky.followPointer(0.06);
    }

    sky.flyForward(120, 92);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
  }
})();
