(async () => {
  const els = [...document.querySelectorAll("[data-link]")];
  if (!els.length) return;

  const parser = new DOMParser();
  const groups = {};

  els.forEach(el => {
    const url = el.dataset.link;
    if (!url) return;
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
      } else if (price) {
        text = `$${price.content || price.textContent.trim()}`;
      } else {
        text = "Price unavailable";
      }

      groups[url].forEach(el => {
        el.textContent = text;
      });
    } catch {
      groups[url].forEach(el => {
        el.textContent = "—";
      });
    }
  }
})();

// <p class="product-price" data-badge="NEW" data-link="https://www.rockymountainatvmc.com/riding-gear/msr-nxt-air-jersey-p" data-target="[itemprop='price']"></p>
