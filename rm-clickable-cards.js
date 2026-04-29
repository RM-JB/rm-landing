(() => {
  document
    .querySelectorAll(`
      .product-grid > div:not(.wrapper),
      .product-grid > .wrapper > div,
      .product-horizontal > div:not(.wrapper),
      .product-horizontal > .wrapper > div,
      .column-2 > div:not(.wrapper),
      .column-2 > .wrapper > div,
      .column-3 > div:not(.wrapper),
      .column-3 > .wrapper > div,
      .column-4 > div:not(.wrapper),
      .column-4 > .wrapper > div
    `)
    .forEach(card => {
      const button = card.querySelector("a.button");
      if (!button) return;

      const href = button.getAttribute("href");
      if (!href) return;

      card.style.cursor = "pointer";

      card.addEventListener("click", e => {
        if (e.target.closest("a")) return;
        window.location.href = href;
      });
    });
})();