(function () {
  var heroIndex = 0;
  var heroTimer = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    function show(index) {
      heroIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === heroIndex);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === heroIndex);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    function restart() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function () {
        show(heroIndex + 1);
      }, 5000);
    }
    restart();
  }

  function initFilter() {
    var wrapper = document.querySelector("[data-filter]");
    var grid = document.querySelector("[data-grid-filter]");
    if (!wrapper || !grid) {
      return;
    }
    var search = wrapper.querySelector("[data-filter-search]");
    var year = wrapper.querySelector("[data-filter-year]");
    var sort = wrapper.querySelector("[data-filter-sort]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
        var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var visible = okKeyword && okYear;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.hidden = shown !== 0;
      }
    }
    function reorder() {
      var value = sort ? sort.value : "default";
      var sorted = cards.slice();
      if (value === "views") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
      } else if (value === "year") {
        sorted.sort(function (a, b) {
          return String(b.getAttribute("data-year")).localeCompare(String(a.getAttribute("data-year")), "zh-Hans-CN");
        });
      } else if (value === "title") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      apply();
    }
    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", reorder);
    }
    apply();
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    if (!form || !input || !results || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    function movieCard(movie) {
      var tags = Array.isArray(movie.tags) ? movie.tags.join(",") : "";
      return [
        '<a class="movie-card" href="detail/' + movie.id + '.html" data-card data-title="' + escapeAttr(movie.title) + '" data-year="' + escapeAttr(movie.year) + '" data-views="' + movie.views + '" data-tags="' + escapeAttr(tags) + '" data-category="' + escapeAttr(movie.category) + '">',
        '  <span class="card-cover" style="--cover-image: url(\'./' + movie.cover + '.jpg\');">',
        '    <span class="cover-shade"></span>',
        '    <span class="play-badge">▶</span>',
        '    <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
        '  </span>',
        '  <span class="card-body">',
        '    <span class="card-title">' + escapeHtml(movie.title) + '</span>',
        '    <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
        '    <span class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span class="pill">' + escapeHtml(movie.category) + '</span></span>',
        '  </span>',
        '</a>'
      ].join("");
    }
    function render() {
      var keyword = input.value.trim().toLowerCase();
      var list = window.MOVIES.filter(function (movie) {
        if (!keyword) {
          return movie.hot;
        }
        return [movie.title, movie.oneLine, movie.year, movie.region, movie.category, (movie.tags || []).join(" ")].join(" ").toLowerCase().indexOf(keyword) !== -1;
      }).slice(0, 180);
      results.innerHTML = list.map(movieCard).join("");
      if (empty) {
        empty.hidden = list.length !== 0;
      }
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var q = input.value.trim();
      var next = q ? "?q=" + encodeURIComponent(q) : window.location.pathname;
      window.history.replaceState(null, "", next);
      render();
    });
    input.addEventListener("input", render);
    render();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function initPlayer() {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    if (!video || !button) {
      return;
    }
    var streamUrl = video.getAttribute("data-stream");
    var initialized = false;
    var hlsInstance = null;
    function attach() {
      if (initialized || !streamUrl) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function start() {
      attach();
      shell.classList.add("is-playing");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          video.controls = true;
        });
      }
    }
    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilter();
    initSearchPage();
    initPlayer();
  });
})();
