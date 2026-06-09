(async () => {
  const links = [...document.querySelectorAll("a[data-product-link][href]")];
  if (!links.length) return;

  const parser = new DOMParser();
  const groups = {};

  const getValue = (el) => {
    if (!el) return "";
    return el.getAttribute("content") || el.textContent.trim();
  };

  const getImageSrc = (img, baseUrl) => {
    if (!img) return "";

    const raw =
      img.getAttribute("src") ||
      img.getAttribute("data-src") ||
      img.getAttribute("data-original") ||
      img.getAttribute("data-lazy-src") ||
      img.getAttribute("data-lazy") ||
      img.getAttribute("data-image") ||
      img.getAttribute("srcset") ||
      "";

    if (!raw) return "";

    const firstSrc = raw.split(",")[0].trim().split(" ")[0];

    try {
      return new URL(firstSrc, baseUrl).href;
    } catch {
      return firstSrc;
    }
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

      const sourceImg = doc.querySelector("img.prodImgMed.initVl");
      const sourceImgSrc = getImageSrc(sourceImg, url);

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
        const existingGeneratedImg = parent.querySelector("img[data-generated-image='true']");
        const brandImg = parent.querySelector("img.brand");

        if (sourceImgSrc && !existingGeneratedImg) {
          const img = document.createElement("img");
          img.src = sourceImgSrc;
          img.alt = sourceImg?.alt || headingText || "";
          img.className = "product-image";
          img.dataset.generatedImage = "true";

          if (brandImg) {
            brandImg.insertAdjacentElement("afterend", img);
          } else {
            parent.insertAdjacentElement("afterbegin", img);
          }
        }

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
    } catch (err) {
      console.warn("Product fetch failed:", url, err);
    }
  }
})();
