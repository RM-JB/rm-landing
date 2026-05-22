(() => {
  document.querySelectorAll(".callouts").forEach(callout => {
    const images = [...callout.querySelectorAll("img")];
    const spans = [...callout.querySelectorAll("span")];

    if (!images.length || !spans.length) return;

    function showImage(index) {
      images.forEach((img, i) => {
        img.style.display = i === index ? "block" : "none";
      });

      spans.forEach((span, i) => {
        span.classList.toggle("active", i === index);
      });
    }

    spans.forEach((span, index) => {
      span.addEventListener("mouseenter", () => showImage(index));
      span.addEventListener("click", () => showImage(index));
    });

    showImage(0);
  });
})();
