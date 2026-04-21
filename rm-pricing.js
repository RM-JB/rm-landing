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
