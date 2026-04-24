(() => {
  const landing = document.querySelector('main#rm-landing');
  if (!landing) return;

  let inspectorEnabled = false;

  const originalTags = new WeakMap();
  const allowedElements = new WeakSet();

  let activeTarget = null;
  let outlinedElement = null;
  let justClosedPopup = false;

  // ================= TOGGLE BUTTON =================
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = 'Inspector ON';

  Object.assign(toggleBtn.style, {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: '1000001',
    padding: '1rem 1.5rem',
    borderRadius: '100vw',
    background: 'rgba(10,10,10,.92)',
    color: '#d7ff9a',
    font: '15px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    border: '1px solid rgba(255,255,255,.08)',
    boxShadow: '0 0 24px rgba(255,255,255,.25)',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)'
  });

  document.body.appendChild(toggleBtn);

  function updateToggleUI() {
    toggleBtn.textContent = inspectorEnabled ? 'Inspector ON' : 'Inspector OFF';
    landing.style.cursor = inspectorEnabled ? 'crosshair' : '';
    // landing.style.cursor = inspectorEnabled ? 'cell' : '';

    // 👇 NEW: color change
    toggleBtn.style.color = inspectorEnabled ? '#d7ff9a' : '#ff6b6b';
  }

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    inspectorEnabled = !inspectorEnabled;

    if (!inspectorEnabled) {
      tooltip.style.display = 'none';
      clearOutline();
      closePopup();
    }

    updateToggleUI();
  });

  updateToggleUI();

  // ================= HELPERS =================
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function decodeHTML(str) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  function getOpeningTagParts(el) {
    return {
      tag: el.tagName.toLowerCase(),
      attrs: el.getAttributeNames().map(name => ({
        name,
        value: el.getAttribute(name)
      }))
    };
  }

  function colorOpeningTag(el) {
    const { tag, attrs } = getOpeningTagParts(el);

    let html = `<span style="color:#9cdcfe;">&lt;</span><span style="color:#4ec9b0;">${tag}</span>`;

    attrs.forEach(attr => {
      html += ` <span style="color:#dcdcaa;">${escapeHTML(attr.name)}</span>`;
      if (attr.value !== '') {
        html += `<span style="color:#9cdcfe;">=</span><span style="color:#ce9178;">"${escapeHTML(attr.value)}"</span>`;
      }
    });

    html += `<span style="color:#9cdcfe;">&gt;</span>`;
    return html;
  }

  function addAllowed(el, depth = 0, maxDepth = 3) {
    if (!el || depth > maxDepth) return;

    if (!el.classList?.contains('wrapper')) {
      allowedElements.add(el);
      originalTags.set(el, colorOpeningTag(el));
    }

    [...el.children].forEach(child => {
      addAllowed(child, depth + 1, maxDepth);
    });
  }

  function captureOriginalElements() {
    [...landing.children].forEach(child => {
      addAllowed(child, 0, 3);
    });
  }

  captureOriginalElements();

  // ================= TOOLTIP =================
  const tooltip = document.createElement('div');

  Object.assign(tooltip.style, {
    position: 'fixed',
    zIndex: '999999',
    pointerEvents: 'none',
    display: 'none',
    width: 'max-content',
    maxWidth: '360px',
    padding: '8px 10px',
    borderRadius: '8px',
    background: 'rgba(10,10,10,.92)',
    font: '12px/1.45 ui-monospace, monospace',
    wordBreak: 'break-word',
    boxShadow: '0 8px 24px rgba(0,0,0,.25)'
  });

  document.body.appendChild(tooltip);

  function clearOutline() {
    if (!outlinedElement) return;
    outlinedElement.style.outline = '';
    outlinedElement.style.outlineOffset = '';
    outlinedElement = null;
  }

  function outlineElement(el) {
    if (outlinedElement === el) return;
    clearOutline();
    outlinedElement = el;
    outlinedElement.style.outline = '2px dotted lime';
    outlinedElement.style.outlineOffset = '-1px';
  }

  function findAllowedTarget(target) {
    if (!target || target === landing || !landing.contains(target)) return null;

    let el = target.nodeType === 1 ? target : target.parentElement;

    while (el && el !== landing) {
      if (allowedElements.has(el)) return el;

      if (el.classList?.contains('wrapper')) {
        const parent = el.parentElement;
        if (parent && allowedElements.has(parent)) return parent;
      }

      el = el.parentElement;
    }

    return null;
  }

  function moveBox(box, e) {
const offset = 14;

let x = e.clientX + offset;
let y = e.clientY + offset;

// Temporarily position to measure
box.style.left = `${x}px`;
box.style.top = `${y}px`;

const rect = box.getBoundingClientRect();

// If overflowing right → flip to left side of cursor
if (rect.right > window.innerWidth - 8) {
  x = e.clientX - rect.width - offset;
}

// If overflowing bottom → flip above cursor
if (rect.bottom > window.innerHeight - 8) {
  y = e.clientY - rect.height - offset;
}

// Final position (clamped slightly inside viewport)
box.style.left = `${Math.max(8, x)}px`;
box.style.top = `${Math.max(8, y)}px`;
}

  document.addEventListener('mousemove', e => {
    if (!inspectorEnabled) return;
    if (e.target.closest('#rm-copy-popup')) return;

    const target = findAllowedTarget(e.target);
    activeTarget = target;

    if (!target) {
      tooltip.style.display = 'none';
      clearOutline();
      return;
    }

    if (!document.querySelector('#rm-copy-popup')) {
      tooltip.innerHTML = originalTags.get(target) || colorOpeningTag(target);
      tooltip.style.display = 'block';
      moveBox(tooltip, e);
    }

    outlineElement(target);
  });

  // ================= COPY LOGIC =================
  function isLowestAllowedLevel(el) {
    return ![...el.children].some(child => {
      if (child.classList?.contains('wrapper')) {
        return [...child.children].length > 0;
      }
      return allowedElements.has(child);
    });
  }

  function unwrapWrappers(node) {
    node.querySelectorAll('.wrapper').forEach(wrapper => {
      while (wrapper.firstChild) {
        wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.remove();
    });
  }

  function cleanClone(el) {
    const clone = el.cloneNode(true);

    unwrapWrappers(clone);

    const all = [clone, ...clone.querySelectorAll('*')];

    all.forEach(node => {
// remove inspector + pointer styles
node.style?.removeProperty('outline');
node.style?.removeProperty('outline-offset');
node.style?.removeProperty('cursor'); // 👈 NEW

// clean empty style attribute
if (!node.getAttribute('style')?.trim()) {
  node.removeAttribute('style');
}

// decode attributes (like href)
[...node.attributes].forEach(attr => {
  node.setAttribute(attr.name, decodeHTML(attr.value));
});
});

    return clone;
  }

  function getOuterHTML(el) {
    return cleanClone(el).outerHTML.trim().replace(/&amp;/g, '&');
  }

  function getElementWithoutChildren(el) {
    const clone = el.cloneNode(false);

    clone.style?.removeProperty('outline');
    clone.style?.removeProperty('outline-offset');

    if (!clone.getAttribute('style')?.trim()) {
      clone.removeAttribute('style');
    }

    [...clone.attributes].forEach(attr => {
      clone.setAttribute(attr.name, decodeHTML(attr.value));
    });

    return clone.outerHTML.trim().replace(/&amp;/g, '&');
  }

  function copyText(text) {
    return navigator.clipboard.writeText(text);
  }

  function closePopup() {
    document.querySelector('#rm-copy-popup')?.remove();
    justClosedPopup = true;
    setTimeout(() => (justClosedPopup = false), 200);
  }

  function openPopup(el, e) {
    const popup = document.createElement('div');
    popup.id = 'rm-copy-popup';

    Object.assign(popup.style, {
      position: 'fixed',
      zIndex: '1000000',
      display: 'grid',
      gap: '8px',
      minWidth: '200px',
      padding: '12px',
      borderRadius: '12px',
      background: 'rgba(10,10,10,.96)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,.08)',
      boxShadow: '0 10px 30px rgba(0,0,0,.35)'
    });

    const lowest = isLowestAllowedLevel(el);

    popup.innerHTML = `
    ${lowest
        ? `<button data-copy="with">Copy element</button>`
        : `
          <button data-copy="without">Copy parent element only</button>
          <button data-copy="with">Copy with children</button>
        `
      }
    <button data-close>Cancel</button>
  `;

    document.body.appendChild(popup);
    moveBox(popup, e);
    popup.querySelectorAll('button').forEach(btn => {
      Object.assign(btn.style, {
        padding: '8px 10px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,.08)',
        background: 'rgba(10,10,10,.92)',
        color: '#d7ff9a',
        font: '12px/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: '0 6px 16px rgba(0,0,0,.25)',
        transition: 'all .15s ease'
      });

      btn.onmouseenter = () => {
        btn.style.background = 'rgba(20,20,20,.95)';
      };

      btn.onmouseleave = () => {
        btn.style.background = 'rgba(10,10,10,.92)';
      };
    });

    popup.addEventListener('click', ev => {
      ev.stopPropagation();

      const btn = ev.target.closest('button');
      if (!btn) return;

      if (btn.dataset.close !== undefined) return closePopup();

      if (btn.dataset.copy === 'with') copyText(getOuterHTML(el));
      if (btn.dataset.copy === 'without') copyText(getElementWithoutChildren(el));

      btn.textContent = 'Copied!';
      setTimeout(closePopup, 400);
    });
  }

  document.addEventListener('click', e => {
    if (!inspectorEnabled) return;
    if (justClosedPopup) return;
    if (e.target.closest('#rm-copy-popup')) return;

    const existing = document.querySelector('#rm-copy-popup');

    if (existing) {
      closePopup();
      return;
    }

    const target = activeTarget || findAllowedTarget(e.target);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();

    openPopup(target, e);
  }, true);
})();
