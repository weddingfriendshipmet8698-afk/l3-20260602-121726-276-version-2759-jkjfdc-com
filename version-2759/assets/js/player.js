(function () {
  function bindStream(video, url) {
    if (!video) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }

    video.src = url;
  }

  window.startMoviePlayback = function (settings) {
    var video = document.getElementById(settings.video);
    var cover = document.getElementById(settings.cover);
    var button = document.getElementById(settings.button);
    var ready = false;

    function playMovie() {
      if (!ready) {
        bindStream(video, settings.url);
        ready = true;
      }

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (cover) {
      cover.addEventListener('click', playMovie);
    }

    if (button) {
      button.addEventListener('click', playMovie);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready || video.paused) {
          playMovie();
        }
      });
    }
  };
})();
