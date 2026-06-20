(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function bindMobileNav() {
    var button = document.querySelector(".mobile-menu-button");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
    });
  }

  function bindHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === current;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindScrollRows() {
    document.querySelectorAll(".horizontal-section").forEach(function (section) {
      var row = section.querySelector("[data-scroll-row]");
      var left = section.querySelector("[data-scroll-left]");
      var right = section.querySelector("[data-scroll-right]");
      if (!row) {
        return;
      }
      if (left) {
        left.addEventListener("click", function () {
          row.scrollBy({ left: -420, behavior: "smooth" });
        });
      }
      if (right) {
        right.addEventListener("click", function () {
          row.scrollBy({ left: 420, behavior: "smooth" });
        });
      }
    });
  }

  function bindFilters() {
    document.querySelectorAll(".filter-section, .quick-search-section").forEach(function (section) {
      var input = section.querySelector("[data-movie-search]");
      var chips = Array.prototype.slice.call(section.querySelectorAll("[data-chip]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
      var empty = document.querySelector(".no-results");
      var activeChip = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var filter = (card.getAttribute("data-filter") || "").toLowerCase();
          var chipOk = activeChip === "all" || filter.indexOf(activeChip.toLowerCase()) !== -1 || text.indexOf(activeChip.toLowerCase()) !== -1;
          var queryOk = !query || text.indexOf(query) !== -1 || filter.indexOf(query) !== -1;
          var keep = chipOk && queryOk;
          card.hidden = !keep;
          if (keep) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          activeChip = chip.getAttribute("data-chip") || "all";
          apply();
        });
      });
    });
  }

  ready(function () {
    bindMobileNav();
    bindHero();
    bindScrollRows();
    bindFilters();
  });
})();

window.bindMoviePlayer = function (streamUrl) {
  var video = document.querySelector(".movie-video");
  var button = document.querySelector(".js-play-button");
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function startPlay() {
    if (started) {
      video.play().catch(function () {});
      return;
    }
    started = true;
    button.classList.add("is-hidden");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.play().catch(function () {
        button.classList.remove("is-hidden");
      });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          button.classList.remove("is-hidden");
        });
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
          started = false;
          button.classList.remove("is-hidden");
        }
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {
      button.classList.remove("is-hidden");
    });
  }

  button.addEventListener("click", startPlay);
  video.addEventListener("click", function () {
    if (!started) {
      startPlay();
    }
  });
};
