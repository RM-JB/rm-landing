document.querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed, .gallery.full-bleed, :is([class^="column-"], [class*=" column-"]).full-bleed')
  .forEach(parent => {
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

document.addEventListener('DOMContentLoaded', () => {
  // Wrap children of full-bleed grids/horizontals
  document
    .querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed')
    .forEach(parent => {
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
    .column-2>div:not(.wrapper),
    .column-2>.wrapper>div,
    .column-3>.wrapper>div,
    .column-3>div:not(.wrapper),
    .column-4>div:not(.wrapper),
    .column-4>.wrapper>div
  `)
    .forEach(card => {
      const button = card.querySelector('a.button');
      if (!button) return;

      const href = button.getAttribute('href');
      if (!href) return;

      card.style.cursor = 'pointer';

      card.onclick = function (e) {
        if (e.target.closest('a')) return;
        window.location.href = href;
      };
    });
});

//YOUTUBE
let ytPlayers = [];

(function loadYouTubeIframeAPI() {
  if (window.YT && window.YT.Player) {
    initYouTubeViewers();
    return;
  }

  const existingScript = document.querySelector(
    'script[src="https://www.youtube.com/iframe_api"]'
  );

  window.onYouTubeIframeAPIReady = initYouTubeViewers;

  if (!existingScript) {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);
  }
})();

function initYouTubeViewers() {
  document.querySelectorAll(".yt-wrapper").forEach(wrapper => {
    if (wrapper.dataset.ytReady === "true") return;
    wrapper.dataset.ytReady = "true";

    const videoId = wrapper.dataset.videoId;
    const overlay = wrapper.querySelector(".yt-overlay");
    const playerEl = wrapper.querySelector(".yt-player");

    if (!videoId || !overlay || !playerEl) return;

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


// PRICING
(async () => {

  const els = [...document.querySelectorAll("[data-link]")];
  const parser = new DOMParser();

  const groups = {};

  els.forEach(el => {
    const url = el.dataset.link;
    (groups[url] ??= []).push(el);
  });

  for (const url in groups) {

    try {

      const res = await fetch(url, { cache: "no-store" });
      const doc = parser.parseFromString(await res.text(), "text/html");

      const low = doc.querySelector("[itemprop='lowPrice']");
      const high = doc.querySelector("[itemprop='highPrice']");
      const price = doc.querySelector("[itemprop='price']");

      let text = "";

      if (low && high) {
        text = `$${low.content} – $${high.content}`;
      }
      else if (price) {
        text = `$${price.content || price.textContent.trim()}`;
      }
      else {
        text = "Price unavailable";
      }

      groups[url].forEach(el => el.textContent = text);

    } catch (e) {
      groups[url].forEach(el => el.textContent = "—");
    }

  }

})();

// <p class="product-price" data-link="PRODUCTLINK" data-target="[itemprop='price']"></p>
