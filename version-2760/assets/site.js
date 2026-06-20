document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  });

  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeChip = "all";

    function matches(card, query, chip) {
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var chipText = chip.toLowerCase();
      var queryMatched = !query || haystack.indexOf(query) !== -1;
      var chipMatched = chip === "all" || haystack.indexOf(chipText) !== -1;
      return queryMatched && chipMatched;
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var ok = matches(card, query, activeChip);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeChip = chip.getAttribute("data-filter-chip") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilters();
      });
    });

    applyFilters();
  });
});
