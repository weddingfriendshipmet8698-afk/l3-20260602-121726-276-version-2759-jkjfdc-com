(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.site-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function nextSlide() {
    showSlide(current + 1);
  }

  function startCarousel() {
    if (timer) {
      clearInterval(timer);
    }
    timer = setInterval(nextSlide, 5200);
  }

  var prevButton = document.querySelector('.hero-prev');
  var nextButton = document.querySelector('.hero-next');

  if (prevButton) {
    prevButton.addEventListener('click', function () {
      showSlide(current - 1);
      startCarousel();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(current + 1);
      startCarousel();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      startCarousel();
    });
  });

  if (slides.length) {
    startCarousel();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.movie-search'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.quick-filters button'));
  var activeFilter = 'all';

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-genre'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    var query = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean)[0] || '';
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var text = cardText(card);
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.style.display = matchQuery && matchFilter ? '' : 'none';
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilter);
  });

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applyFilter();
    });
  });

  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var source = shell.getAttribute('data-video');

    if (!video || !source) {
      return;
    }

    function bindSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      if (!video.getAttribute('src') && !shell.dataset.ready) {
        bindSource();
        shell.dataset.ready = '1';
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(initPlayer);
})();
