function initHomeSlides() {
  if (typeof window.destroyHomeSlides === "function") {
    window.destroyHomeSlides();
  }

  var slider = document.querySelector("[data-home-slides]");

  if (!slider) {
    return;
  }

  slider.dataset.homeSlidesReady = "true";

  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-home-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
  var previousButton = slider.querySelector("[data-slide-prev]");
  var nextButton = slider.querySelector("[data-slide-next]");
  var interval = Number(slider.dataset.sliderInterval) || 7000;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0;
  var timer = null;
  var wheelTimer = null;
  var wheelLocked = false;
  var wheelThreshold = 24;
  var wheelCooldown = 720;
  var destroyed = false;

  if (slides.length <= 1) {
    return;
  }

  function setSlide(index) {
    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      var isActive = slideIndex === current;

      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", isActive ? "false" : "true");
    });

    dots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === current;

      dot.classList.toggle("is-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startTimer() {
    stopTimer();

    if (!destroyed && !document.hidden && !prefersReducedMotion && interval > 0) {
      timer = window.setTimeout(function advanceSlide() {
        setSlide(current + 1);
        timer = window.setTimeout(advanceSlide, interval);
      }, interval);
    }
  }

  function handleClick(event) {
    var target = event.target;

    if (!target || typeof target.closest !== "function") {
      return;
    }

    if (previousButton && target.closest("[data-slide-prev]")) {
      setSlide(current - 1);
      startTimer();
      return;
    }

    if (nextButton && target.closest("[data-slide-next]")) {
      setSlide(current + 1);
      startTimer();
      return;
    }

    var dot = target.closest("[data-slide-dot]");

    if (dot && slider.contains(dot)) {
      setSlide(Number(dot.dataset.slideDot));
      startTimer();
    }
  }

  function handleWheel(event) {
    if (Math.abs(event.deltaY) < wheelThreshold || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();

    if (wheelLocked) {
      return;
    }

    wheelLocked = true;
    setSlide(current + (event.deltaY > 0 ? 1 : -1));
    startTimer();

    window.clearTimeout(wheelTimer);
    wheelTimer = window.setTimeout(function () {
      wheelLocked = false;
    }, wheelCooldown);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  function destroyHomeSlides() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    stopTimer();
    window.clearTimeout(wheelTimer);
    wheelTimer = null;
    slider.removeEventListener("click", handleClick);
    slider.removeEventListener("wheel", handleWheel);
    slider.removeEventListener("focusin", stopTimer);
    slider.removeEventListener("focusout", startTimer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    slider.dataset.homeSlidesReady = "false";

    if (window.destroyHomeSlides === destroyHomeSlides) {
      window.destroyHomeSlides = null;
    }

    slides = null;
    dots = null;
    previousButton = null;
    nextButton = null;
    slider = null;
  }

  slider.addEventListener("click", handleClick);
  slider.addEventListener("wheel", handleWheel, { passive: false });
  slider.addEventListener("focusin", stopTimer);
  slider.addEventListener("focusout", startTimer);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.destroyHomeSlides = destroyHomeSlides;

  setSlide(0);
  startTimer();
}

window.initHomeSlides = initHomeSlides;
initHomeSlides();
