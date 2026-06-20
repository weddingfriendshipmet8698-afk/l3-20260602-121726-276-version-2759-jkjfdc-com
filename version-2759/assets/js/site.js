(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav-links');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterList = document.querySelector('[data-filter-list]');

  function runFilter() {
    if (!filterList) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterYear ? filterYear.value : '';
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
      var matchedKeyword = keyword === '' || haystack.indexOf(keyword) !== -1;
      var matchedYear = year === '' || card.getAttribute('data-year') === year;
      card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', runFilter);
  }

  if (filterYear) {
    filterYear.addEventListener('change', runFilter);
  }
})();
