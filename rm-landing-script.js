document.querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed, .gallery.full-bleed, :is([class^="column-"], [class*=" column-"]).full-bleed')
  .forEach(parent =>{
    // Skip if already wrapped (prevents duplication)
    if (parent.querySelector(':scope>.wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('wrapper');

    // Move all children into wrapper
    while (parent.firstChild) {
      wrapper.appendChild(parent.firstChild);
    }

    parent.appendChild(wrapper);
  });

document.addEventListener('DOMContentLoaded', () =>{
  // Wrap children of full-bleed grids/horizontals
  document
    .querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed')
    .forEach(parent =>{
      if (parent.querySelector(':scope>.wrapper')) return;

      const wrapper = document.createElement('div');
      wrapper.classList.add('wrapper');

      while (parent.firstChild) {
        wrapper.appendChild(parent.firstChild);
      }

      parent.appendChild(wrapper);
    });

  // Add onclick to each card div based on its own a.button link
  document
    .querySelectorAll(`
    .product-grid>div:not(.wrapper),
    .product-grid>.wrapper>div,
    .product-horizontal>div:not(.wrapper),
    .product-horizontal>.wrapper>div,
    .collection>div
  `)
    .forEach(card =>{
      const button = card.querySelector('a.button');
      if (!button) return;

      const href = button.getAttribute('href');
      if (!href) return;

      // card.style.cursor = 'pointer';

      card.onclick = function (e) {
        if (e.target.closest('a, button')) return;
        window.location.href = href;
      };
    });
});

//YOUTUBE
let ytPlayers = [];

    function onYouTubeIframeAPIReady() {
        document.querySelectorAll(".yt-wrapper").forEach(wrapper => {
            const videoId = wrapper.dataset.videoId;
            const overlay = wrapper.querySelector(".yt-overlay");
            const playerEl = wrapper.querySelector(".yt-player");

            // Set thumbnail
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
                        // ENDED
                        if (event.data === YT.PlayerState.ENDED) {
                            overlay.classList.remove("hidden");
                        }
                    }
                }
            });

            ytPlayers.push(player);

            overlay.addEventListener("click", () => {
                overlay.classList.add("hidden");
                player.playVideo();
            });
        });
    }
