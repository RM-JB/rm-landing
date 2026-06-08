(async () => {
  const links = [...document.querySelectorAll("a[data-product-link][href]")];
  if (!links.length) return;

  const parser = new DOMParser();
  const groups = {};

  const getValue = (el) => {
    if (!el) return "";
    return el.getAttribute("content") || el.textContent.trim();
  };

  links.forEach((link) => {
    const url = link.href;
    (groups[url] ??= []).push(link);
  });

  for (const url in groups) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");

      const headingText =
        doc.querySelector("h1#heading")?.textContent.trim() || "—";

      const lowValue = getValue(doc.querySelector("[itemprop='lowPrice']"));
      const highValue = getValue(doc.querySelector("[itemprop='highPrice']"));
      const priceValue = getValue(doc.querySelector("[itemprop='price']"));

      let priceText = "—";

      if (lowValue && highValue) {
        priceText = `$${lowValue} – $${highValue}`;
      } else if (priceValue) {
        priceText = `$${priceValue}`;
      }

      groups[url].forEach((link) => {
        const parent = link.parentElement;

        const existingH2 = parent.querySelector("h2");
        const existingP = parent.querySelector("p");

        if (!existingH2) {
          const title = document.createElement("h2");
          title.textContent = headingText;
          title.dataset.generatedHeading = "true";

          link.insertAdjacentElement("beforebegin", title);
        }

        if (!existingP) {
          const price = document.createElement("p");
          price.className = "product-price";
          price.textContent = priceText;
          price.dataset.generatedPrice = "true";

          link.insertAdjacentElement("beforebegin", price);
        }
      });
    } catch {
      groups[url].forEach((link) => {
        const parent = link.parentElement;

        if (!parent.querySelector("h2")) {
          const title = document.createElement("h2");
          title.textContent = "—";
          title.dataset.generatedHeading = "true";

          link.insertAdjacentElement("beforebegin", title);
        }

        if (!parent.querySelector("p")) {
          const price = document.createElement("p");
          price.className = "product-price";
          price.textContent = "—";
          price.dataset.generatedPrice = "true";

          link.insertAdjacentElement("beforebegin", price);
        }
      });
    }
  }
})();
