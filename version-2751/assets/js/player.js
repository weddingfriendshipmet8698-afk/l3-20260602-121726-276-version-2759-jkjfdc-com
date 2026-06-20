function initStaticPlayer(videoId, buttonId, src) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var started = false;
  var hlsInstance = null;

  if (!video || !button || !src) {
    return;
  }

  function attach() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    attach();
    button.classList.add("hidden");
    var playResult = video.play();

    if (playResult && typeof playResult.catch === "function") {
      playResult.catch(function () {
        button.classList.remove("hidden");
      });
    }
  }

  button.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      start();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      button.classList.remove("hidden");
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
