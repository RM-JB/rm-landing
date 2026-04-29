(() => {
  const basePath = document.currentScript?.src
    ? new URL(".", document.currentScript.src).href
    : "";

  const loadScript = src => {
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  };

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".full-bleed")) {
      loadScript(`${basePath}rm-wrapper.js`);
    }

    if (document.querySelector(".product-grid, .product-horizontal, .column-2, .column-3, .column-4")) {
      loadScript(`${basePath}rm-clickable-cards.js`);
    }

    if (document.querySelector(".yt-wrapper")) {
      loadScript(`${basePath}rm-youtube.js`);
    }

    if (document.querySelector("[data-link]")) {
      loadScript(`${basePath}rm-pricing.js`);
    }

    if (document.querySelector("#rm-landing .slider")) {
      loadScript(`${basePath}rm-slider.js`);
    }
  });
})();