(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      var input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        return;
      }
    });
  });

  document.querySelectorAll("[data-local-filter]").forEach(function (form) {
    var input = form.querySelector("input");
    var list = document.querySelector("[data-filter-list]");
    var empty = document.querySelector("[data-empty-state]");

    if (!input || !list) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      input.value = query;
    }

    var applyFilter = function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;

      list.querySelectorAll(".filter-item").forEach(function (item) {
        var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
        var show = !value || text.indexOf(value) !== -1;
        item.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    input.addEventListener("input", applyFilter);
    applyFilter();
  });

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    var setSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
      });
    });

    window.setInterval(function () {
      setSlide(current + 1);
    }, 5600);
  }
})();
