(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    if (typeof playUrl !== "string" || !playUrl) {
      return;
    }
    var frame = document.querySelector("[data-player]");
    if (!frame) {
      return;
    }
    var video = frame.querySelector("video");
    var cover = frame.querySelector("[data-player-cover]");
    var button = frame.querySelector("[data-play-button]");
    var error = frame.querySelector("[data-player-error]");
    var started = false;
    var hls = null;

    function showError() {
      if (error) {
        error.textContent = "播放暂时无法加载，请稍后再试";
        error.classList.add("is-visible");
      }
    }

    function play() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function attach() {
      if (started) {
        play();
        return;
      }
      started = true;
      frame.classList.add("is-playing");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playUrl;
        play();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(playUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          play();
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
        return;
      }
      video.src = playUrl;
      play();
    }

    if (cover) {
      cover.addEventListener("click", attach);
    }
    if (button) {
      button.addEventListener("click", attach);
    }
    video.addEventListener("play", function () {
      frame.classList.add("is-playing");
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
