(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function matches(card, query, category) {
    var text = (card.getAttribute("data-search") || "").toLowerCase();
    var cat = card.getAttribute("data-category") || "";
    var okText = !query || text.indexOf(query) !== -1;
    var okCat = !category || category === "all" || cat === category;
    return okText && okCat;
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    if (slides.length > 1) {
      var index = 0;
      setInterval(function () {
        slides[index].classList.remove("active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("active");
      }, 5200);
    }

    var filterInput = document.querySelector(".filter-input");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".filter-tabs button"));
    var empty = document.querySelector(".empty-state");
    var activeCategory = "all";

    function applyFilter() {
      var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var shown = 0;
      cards.forEach(function (card) {
        if (matches(card, query, activeCategory)) {
          card.style.display = "";
          shown += 1;
        } else {
          card.style.display = "none";
        }
      });
      if (empty) {
        empty.style.display = shown ? "none" : "block";
      }
    }

    if (filterInput) {
      var params = new URLSearchParams(location.search);
      var q = params.get("q");
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener("input", applyFilter);
      applyFilter();
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (item) {
          item.classList.remove("active");
        });
        tab.classList.add("active");
        activeCategory = tab.getAttribute("data-filter") || "all";
        applyFilter();
      });
    });
  });

  function startVideo(video, cover, url, HlsClass) {
    if (!video || !url) {
      return;
    }
    if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
      var hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(HlsClass.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.play().catch(function () {});
    } else {
      video.src = url;
      video.play().catch(function () {});
    }
    if (cover) {
      cover.classList.add("hidden");
    }
  }

  function loadCdn(callback) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    var existing = document.querySelector("script[data-hls-cdn]");
    if (existing) {
      existing.addEventListener("load", function () {
        callback(window.Hls);
      });
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.setAttribute("data-hls-cdn", "1");
    script.onload = function () {
      callback(window.Hls);
    };
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (url) {
    ready(function () {
      var video = document.querySelector(".movie-video");
      var cover = document.querySelector(".play-cover");
      var button = document.querySelector(".play-btn");
      var prepared = false;
      function play() {
        if (prepared) {
          video.play().catch(function () {});
          if (cover) {
            cover.classList.add("hidden");
          }
          return;
        }
        prepared = true;
        if (window.Hls) {
          startVideo(video, cover, url, window.Hls);
          return;
        }
        import("./hls-vendor.js")
          .then(function (mod) {
            window.Hls = mod.H || mod.default || window.Hls;
            startVideo(video, cover, url, window.Hls);
          })
          .catch(function () {
            loadCdn(function (HlsClass) {
              startVideo(video, cover, url, HlsClass);
            });
          });
      }
      if (button) {
        button.addEventListener("click", play);
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  };
})();
