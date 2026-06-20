(function () {
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector("[data-player-overlay]");
      var button = player.querySelector("[data-play-button]");
      var stream = video ? video.getAttribute("data-stream") : "";
      var hls = null;
      var bound = false;

      function bindStream() {
        if (!video || !stream || bound) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          bound = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          bound = true;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }

        bindStream();
        video.setAttribute("controls", "controls");
        var playAction = video.play();

        if (overlay) {
          overlay.classList.add("is-hidden");
        }

        if (playAction && typeof playAction.catch === "function") {
          playAction.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      bindStream();

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }

      if (overlay) {
        overlay.addEventListener("click", function () {
          startPlayback();
        });
      }

      if (video) {
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("pause", function () {
          if (overlay && video.currentTime === 0) {
            overlay.classList.remove("is-hidden");
          }
        });
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
}());
