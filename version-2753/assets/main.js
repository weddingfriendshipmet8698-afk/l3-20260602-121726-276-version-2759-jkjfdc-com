(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  var filterPanel = document.querySelector('[data-filter-panel]');
  if (filterPanel) {
    var searchInput = filterPanel.querySelector('[data-local-search]');
    var typeFilter = filterPanel.querySelector('[data-type-filter]');
    var yearFilter = filterPanel.querySelector('[data-year-filter]');
    var grid = document.querySelector('[data-sortable-grid]');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];

    function applyFilter() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var type = typeFilter ? typeFilter.value : '';

      cards.forEach(function (card) {
        var text = [
          card.dataset.title || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.genre || ''
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !type || (card.dataset.type || '') === type;
        card.classList.toggle('is-hidden', !(matchKeyword && matchType));
      });
    }

    function applySort() {
      if (!grid || !yearFilter) {
        return;
      }

      var direction = yearFilter.value === 'asc' ? 1 : -1;
      cards.sort(function (a, b) {
        var ay = Number(a.dataset.year || 0);
        var by = Number(b.dataset.year || 0);
        return (ay - by) * direction;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applySort);
    }
  }

  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');
  if (searchResults && window.MovieSearchIndex) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-input]');

    if (searchInput) {
      searchInput.value = query;
    }

    if (query) {
      var lower = query.toLowerCase();
      var matches = window.MovieSearchIndex.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.oneLine
        ].join(' ').toLowerCase();
        return text.indexOf(lower) !== -1;
      }).slice(0, 120);

      if (searchTitle) {
        searchTitle.textContent = matches.length ? '搜索结果' : '没有找到匹配影片';
      }

      searchResults.innerHTML = matches.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="poster" href="' + movie.url + '">',
          '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '    <span class="poster-badge">' + escapeHtml(movie.region) + '</span>',
          '    <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
          '  </a>',
          '  <div class="card-body">',
          '    <a class="card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
          '    <p>' + escapeHtml(movie.oneLine) + '</p>',
          '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }
})();
