document.querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed, .gallery.full-bleed')
.forEach(parent => {
  // Skip if already wrapped (prevents duplication)
  if (parent.querySelector(':scope > .wrapper')) return;

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
    if (parent.querySelector(':scope > .wrapper')) return;

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
  .product-grid > div:not(.wrapper),
  .product-grid > .wrapper > div,
  .product-horizontal > div:not(.wrapper),
  .product-horizontal > .wrapper > div,
  .collection > div
`)
  .forEach(card => {
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
