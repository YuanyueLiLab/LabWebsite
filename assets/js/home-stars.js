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
  var hasTouchInput = (
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(any-pointer: coarse)").matches
  );
  var constrainedDevice = (
    compactViewport ||
    Boolean(connection && connection.saveData) ||
    Boolean(navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
  );
  var skyLayers = prefersReducedMotion ? 2 : (constrainedDevice ? 3 : 4);
  var skyDensity = prefersReducedMotion ? 3 : (constrainedDevice ? 4 : 6);
  var activeMeteors = [];
  var activeTwinkles = [];
  var destroyed = false;
  var meteorTimer = null;
  var firstMeteorTimer = null;
  var twinkleTimer = null;

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

  function findTwinkleStar() {
    var stars = skyNode.querySelectorAll(".star");

    if (!stars.length) {
      return null;
    }

    for (var attempt = 0; attempt < 18; attempt++) {
      var star = stars[Math.floor(Math.random() * stars.length)];
      var rect;

      if (star.firstElementChild || star.classList.contains("is-twinkling")) {
        continue;
      }

      rect = star.getBoundingClientRect();

      if (
        rect.right >= 0 &&
        rect.bottom >= 0 &&
        rect.left <= window.innerWidth &&
        rect.top <= window.innerHeight
      ) {
        return star;
      }
    }

    return null;
  }

  function removeTwinkle(twinkleRecord) {
    var recordIndex = activeTwinkles.indexOf(twinkleRecord);

    if (recordIndex !== -1) {
      activeTwinkles.splice(recordIndex, 1);
    }

    window.clearTimeout(twinkleRecord.timer);
    twinkleRecord.node.classList.remove("is-twinkling");
    twinkleRecord.node.style.removeProperty("--twinkle-duration");
    twinkleRecord.node.style.removeProperty("--twinkle-ray-length");
  }

  function clearTwinkles() {
    while (activeTwinkles.length) {
      removeTwinkle(activeTwinkles[activeTwinkles.length - 1]);
    }
  }

  function scheduleTwinkle(minDelay, maxDelay) {
    window.clearTimeout(twinkleTimer);

    if (destroyed || document.hidden) {
      twinkleTimer = null;
      return;
    }

    twinkleTimer = window.setTimeout(
      createTwinkle,
      randomBetween(minDelay || 100, maxDelay || 300)
    );
  }

  function createTwinkle() {
    var duration;
    var star;
    var twinkleRecord;

    twinkleTimer = null;

    if (destroyed || document.hidden) {
      return;
    }

    if (activeTwinkles.length >= 3) {
      scheduleTwinkle();
      return;
    }

    star = findTwinkleStar();

    if (!star) {
      scheduleTwinkle(100, 300);
      return;
    }

    duration = randomBetween(1050, 3750);
    twinkleRecord = {
      node: star,
      timer: null
    };
    activeTwinkles.push(twinkleRecord);
    star.style.setProperty("--twinkle-duration", duration + "ms");
    star.style.setProperty("--twinkle-ray-length", randomBetween(36, 64) + "px");
    star.classList.add("is-twinkling");

    twinkleRecord.timer = window.setTimeout(function () {
      removeTwinkle(twinkleRecord);
    }, duration + 80);
    scheduleTwinkle();
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
      window.clearTimeout(twinkleTimer);
      firstMeteorTimer = null;
      meteorTimer = null;
      twinkleTimer = null;
      clearTwinkles();
      clearMeteors();
      return;
    }

    sky.setPaused(false);
    scheduleFirstMeteor();
    scheduleMeteor();
    scheduleTwinkle(150, 500);
  }

  function destroyHomeStars() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    window.clearTimeout(firstMeteorTimer);
    window.clearTimeout(meteorTimer);
    window.clearTimeout(twinkleTimer);
    firstMeteorTimer = null;
    meteorTimer = null;
    twinkleTimer = null;
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    clearTwinkles();
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
    if (compactViewport || hasTouchInput || !constrainedDevice) {
      sky.followPointer(0.01, 0.5);
    }

    sky.flyForward(120, 92);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
  }
})();
