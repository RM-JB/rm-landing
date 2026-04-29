document.querySelectorAll('.product-grid.full-bleed, .product-horizontal.full-bleed, .gallery.full-bleed, :is([class^="column-"], [class*=" column-"]).full-bleed, nav.full-bleed')
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
    })();