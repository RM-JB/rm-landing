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
      loadScript(`https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-wrapper.js`);
    }

    if (document.querySelector(".product-grid, .product-horizontal, .column-2, .column-3, .column-4")) {
      loadScript(`https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-clickable-cards.js`);
    }

    if (document.querySelector(".yt-wrapper")) {
      loadScript(`https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-youtube.js`);
    }

    if (document.querySelector("[data-link]")) {
      loadScript(`https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-pricing.js`);
    }

    if (document.querySelector("#rm-landing .slider")) {
      loadScript(`https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-slider.js`);
    }
  });
})();
