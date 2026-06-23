(function () {
  var slider = document.querySelector("[data-home-slides]");

  if (!slider) {
    return;
  }

  var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-home-slide]"));
  var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
  var previousButton = slider.querySelector("[data-slide-prev]");
  var nextButton = slider.querySelector("[data-slide-next]");
  var interval = Number(slider.dataset.sliderInterval) || 7000;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = 0;
  var timer = null;

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

    if (!prefersReducedMotion && interval > 0) {
      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, interval);
    }
  }

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      setSlide(current - 1);
      startTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      setSlide(current + 1);
      startTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      setSlide(Number(dot.dataset.slideDot));
      startTimer();
    });
  });

  slider.addEventListener("focusin", stopTimer);
  slider.addEventListener("focusout", startTimer);

  setSlide(0);
  startTimer();
})();
