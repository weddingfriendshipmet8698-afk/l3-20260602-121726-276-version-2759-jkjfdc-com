(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function run() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      run();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
    });
    run();
  }

  function setupLocalFilter() {
    var input = document.querySelector("[data-filter-input]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      var q = normalize(input.value);
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-filter"));
        card.classList.toggle("is-hidden", q && haystack.indexOf(q) === -1);
      });
    });
  }

  function cardMarkup(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"movie-poster\" href=\"" + movie.url + "\" title=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"./" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"duration\">" + escapeHtml(movie.duration) + "</span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<a class=\"movie-title\" href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return (value || "").toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearch() {
    var box = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!box || !results || !window.MOVIES) {
      return;
    }
    var title = document.querySelector("[data-search-title]");
    var typeSelect = document.querySelector("[data-search-type]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    box.value = initial;

    function render() {
      var q = normalize(box.value);
      var type = typeSelect ? normalize(typeSelect.value) : "";
      var list = window.MOVIES.filter(function (movie) {
        var text = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var typeOk = !type || normalize(movie.type).indexOf(type) !== -1;
        return typeOk && (!q || text.indexOf(q) !== -1);
      }).slice(0, 120);
      results.innerHTML = list.map(cardMarkup).join("");
      if (title) {
        title.textContent = q ? "搜索结果" : "精选影片";
      }
      if (!list.length) {
        results.innerHTML = "<div class=\"detail-article\"><h2>没有找到匹配影片</h2><p>可以换一个片名、地区、年份或类型继续搜索。</p></div>";
      }
    }

    box.addEventListener("input", render);
    if (typeSelect) {
      typeSelect.addEventListener("change", render);
    }
    var form = box.closest("form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        if (box.value.trim()) {
          url.searchParams.set("q", box.value.trim());
        } else {
          url.searchParams.delete("q");
        }
        window.history.replaceState(null, "", url.toString());
        render();
      });
    }
    render();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearch();
  });
})();
