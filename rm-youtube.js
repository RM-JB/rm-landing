(() => {
  window.rmYtPlayers = window.rmYtPlayers || [];

  function initYouTubeViewers() {
    document.querySelectorAll(".yt-wrapper").forEach(wrapper => {
      if (wrapper.dataset.ytReady === "true") return;
      wrapper.dataset.ytReady = "true";

      const videoId = wrapper.dataset.videoId;
      const overlay = wrapper.querySelector(".yt-overlay");
      const playerEl = wrapper.querySelector(".yt-player");

      if (!videoId || !overlay || !playerEl) return;

      overlay.style.backgroundImage =
        `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`;

      const player = new YT.Player(playerEl, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1
        },
        events: {
          onStateChange: event => {
            if (event.data === YT.PlayerState.ENDED) {
              overlay.classList.remove("hidden");
            }
          }
        }
      });

      window.rmYtPlayers.push(player);

      overlay.addEventListener("click", () => {
        overlay.classList.add("hidden");
        player.playVideo();
      });
    });
  }

  if (window.YT && window.YT.Player) {
    initYouTubeViewers();
    return;
  }

  const oldReady = window.onYouTubeIframeAPIReady;

  window.onYouTubeIframeAPIReady = () => {
    if (typeof oldReady === "function") oldReady();
    initYouTubeViewers();
  };

  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  }
})();