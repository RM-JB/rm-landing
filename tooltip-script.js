(function () {
  const ROOT_SELECTOR = '#rm-landing';
  const VOID_TAGS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ]);

  let active = false;
  let hoveredEl = null;
  let hoveredParentEl = null;
  let lastMouseX = 0;
  let lastMouseY = 0;

  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;

  const style = document.createElement('style');
  style.textContent = `
  #rm-inspector-toggle {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 2147483647;
    padding: 10px 14px;
    border: 1px solid #222;
    background: #111;
    color: #fff;
    font: 600 14px/1.2 Arial, sans-serif;
    border-radius: 8px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0,0,0,.2);
    transition: background .18s ease, border-color .18s ease, color .18s ease, transform .12s ease;
  }

  #rm-inspector-toggle:hover {
    transform: translateY(-1px);
  }

  #rm-inspector-toggle.rm-on {
    background: #1d3b00;
    border-color: #7CFC00;
    color: #7CFC00;
  }

  #rm-inspector-parent-overlay,
  #rm-inspector-overlay {
    position: fixed;
    z-index: 2147483645;
    pointer-events: none;
    box-sizing: border-box;
    display: none;
  }

  #rm-inspector-parent-overlay {
    border: 2px dotted #00bfff;
  }

  #rm-inspector-overlay {
    z-index: 2147483646;
    border: 2px dotted lime;
  }

  #rm-inspector-tooltip {
    position: fixed;
    z-index: 2147483647;
    pointer-events: none;
    display: none;
    width: 420px;
    max-width: calc(100vw - 24px);
    max-height: min(60vh, 500px);
    overflow: auto;
    padding: 10px 12px;
    background: rgba(11, 15, 20, 0.97);
    border: 1px solid #2f3b46;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.3);
    font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    white-space: normal;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  #rm-inspector-tooltip .rm-tip-block + .rm-tip-block {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,.12);
  }

  #rm-inspector-tooltip .rm-tip-label {
    display: block;
    margin-bottom: 6px;
    font: 600 11px/1.2 Arial, sans-serif;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #8b949e;
  }

  #rm-inspector-tooltip .tok-punc  { color: #c9d1d9; }
  #rm-inspector-tooltip .tok-tag   { color: #7ee787; }
  #rm-inspector-tooltip .tok-attr  { color: #79c0ff; }
  #rm-inspector-tooltip .tok-eq    { color: #c9d1d9; }
  #rm-inspector-tooltip .tok-value { color: #a5d6ff; }

  #rm-inspector-menu {
    position: fixed;
    z-index: 2147483647;
    display: none;
    min-width: 240px;
    background: rgba(11, 15, 20, 0.98);
    border: 1px solid #2f3b46;
    border-radius: 10px;
    box-shadow: 0 12px 28px rgba(0,0,0,.35);
    padding: 6px;
    user-select: none;
    opacity: 0;
    transform: translateY(4px) scale(.98);
    transition: opacity .14s ease, transform .14s ease;
  }

  #rm-inspector-menu.rm-open {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  #rm-inspector-menu .rm-menu-header {
    display: flex;
    justify-content: flex-end;
    padding: 2px 4px 6px;
  }

  #rm-inspector-menu .rm-close {
    border: 0;
    background: transparent;
    color: #8b949e;
    font-size: 14px;
    padding: 4px 6px;
    border-radius: 6px;
  }

  #rm-inspector-menu .rm-close:hover {
    background: rgba(255,255,255,.08);
    color: #fff;
  }

  #rm-inspector-menu button.action {
    display: block;
    width: 100%;
    border: 0;
    background: transparent;
    color: #e6edf3;
    text-align: left;
    padding: 10px 12px;
    border-radius: 8px;
    font: 500 13px/1.25 Arial, sans-serif;
  }

  #rm-inspector-menu button.action:hover {
    background: rgba(121,192,255,.12);
  }

  #rm-inspector-menu .rm-copy-current:hover {
    color: #7ee787;
  }

  #rm-inspector-menu .rm-copy-parent:hover,
  #rm-inspector-menu .rm-copy-section:hover {
    color: #79c0ff;
  }

  body.rm-inspector-active,
  body.rm-inspector-active * {
    cursor: crosshair !important;
  }

  #rm-inspector-menu,
  #rm-inspector-menu * {
    cursor: auto !important;
  }

  #rm-inspector-menu button,
  #rm-inspector-menu .rm-close {
    cursor: pointer !important;
  }
`;
  document.head.appendChild(style);

  const parentOverlay = document.createElement('div');
  parentOverlay.id = 'rm-inspector-parent-overlay';
  document.body.appendChild(parentOverlay);

  const overlay = document.createElement('div');
  overlay.id = 'rm-inspector-overlay';
  document.body.appendChild(overlay);

  const tooltip = document.createElement('div');
  tooltip.id = 'rm-inspector-tooltip';
  document.body.appendChild(tooltip);

  const menu = document.createElement('div');
  menu.id = 'rm-inspector-menu';
  menu.innerHTML = `
  <div class="rm-menu-header">
    <button type="button" class="rm-close" aria-label="Close copy menu">✕</button>
  </div>
  <button type="button" class="action rm-copy-current">Copy current element</button>
  <button type="button" class="action rm-copy-parent">Copy parent element with children</button>
`;
  document.body.appendChild(menu);

  const copyCurrentBtn = menu.querySelector('.rm-copy-current');
  const copyParentBtn = menu.querySelector('.rm-copy-parent');

  const toggle = document.createElement('button');
  toggle.id = 'rm-inspector-toggle';
  toggle.type = 'button';
  toggle.textContent = 'Inspector: Off';
  document.body.appendChild(toggle);

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttrForDisplay(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttrForCopy(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  function getOpeningTagHtml(el) {
    const tag = el.tagName.toLowerCase();
    let html = `<span class="tok-punc">&lt;</span><span class="tok-tag">${tag}</span>`;

    Array.from(el.attributes).forEach(attr => {
      html += ` <span class="tok-attr">${escapeHtml(attr.name)}</span><span class="tok-eq">=</span><span class="tok-value">"${escapeAttrForDisplay(attr.value)}"</span>`;
    });

    html += `<span class="tok-punc">&gt;</span>`;
    return html;
  }

  function isDirectChildOfRoot(el) {
    return !!el && el.parentElement === root;
  }

  function getMaxParent(el) {
    if (!el || el === root || isDirectChildOfRoot(el)) return null;

    let current = el.parentElement;
    if (!current || current === root) return null;

    while (current.parentElement && current.parentElement !== root) {
      current = current.parentElement;
    }

    return current;
  }

  function getCopyContainer(el) {
    if (!el || el === root) return null;
    return getMaxParent(el) || (isDirectChildOfRoot(el) ? el : null);
  }

  function getCopyContainerLabel(el) {
    if (!el || el === root) return '';
    if (getMaxParent(el)) return 'Copy parent element with children';
    if (isDirectChildOfRoot(el)) return 'Copy section with children';
    return '';
  }

  function serializeNodeRaw(node) {
    if (!node) return '';

    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue || '';
    }

    if (node.nodeType === Node.COMMENT_NODE) {
      return `<!--${node.nodeValue || ''}-->`;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const tag = node.tagName.toLowerCase();
    const attrs = Array.from(node.attributes)
      .map(attr => ` ${attr.name}="${escapeAttrForCopy(attr.value)}"`)
      .join('');

    const opening = `<${tag}${attrs}>`;

    if (VOID_TAGS.has(tag)) {
      return opening;
    }

    let inner = '';
    node.childNodes.forEach(child => {
      inner += serializeNodeRaw(child);
    });

    return `${opening}${inner}</${tag}>`;
  }

  function setBoxToElement(box, el) {
    if (!el) {
      box.style.display = 'none';
      return;
    }

    const rect = el.getBoundingClientRect();
    box.style.display = 'block';
    box.style.left = rect.left + 'px';
    box.style.top = rect.top + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
  }

  function positionTooltip(x, y) {
    const gap = 16;
    const pad = 8;
    const rect = tooltip.getBoundingClientRect();

    let left = x + gap;
    let top = y + gap;

    if (left + rect.width + pad > window.innerWidth) {
      left = x - rect.width - gap;
    }
    if (top + rect.height + pad > window.innerHeight) {
      top = y - rect.height - gap;
    }

    tooltip.style.left = Math.max(pad, left) + 'px';
    tooltip.style.top = Math.max(pad, top) + 'px';
  }

  function positionMenu(x, y) {
    const gap = 12;
    const pad = 8;
    const label = getCopyContainerLabel(hoveredEl);

    if (label) {
      copyParentBtn.style.display = 'block';
      copyParentBtn.textContent = label;
      copyParentBtn.className = 'action ' + (isDirectChildOfRoot(hoveredEl) ? 'rm-copy-section' : 'rm-copy-parent');
    } else {
      copyParentBtn.style.display = 'none';
    }

    menu.style.display = 'block';
    menu.classList.remove('rm-open');

    const rect = menu.getBoundingClientRect();

    let left = x + gap;
    let top = y + gap;

    if (left + rect.width + pad > window.innerWidth) {
      left = x - rect.width - gap;
    }
    if (top + rect.height + pad > window.innerHeight) {
      top = y - rect.height - gap;
    }

    menu.style.left = Math.max(pad, left) + 'px';
    menu.style.top = Math.max(pad, top) + 'px';

    requestAnimationFrame(() => {
      menu.classList.add('rm-open');
    });
  }

  function hideMenu() {
    menu.classList.remove('rm-open');
    menu.style.display = 'none';
  }

  function clearInspector() {
    hoveredEl = null;
    hoveredParentEl = null;
    overlay.style.display = 'none';
    parentOverlay.style.display = 'none';
    tooltip.style.display = 'none';
  }

  function updateInspector(el) {
    if (!el || el === root) {
      clearInspector();
      return;
    }

    hoveredEl = el;
    hoveredParentEl = getMaxParent(el);

    setBoxToElement(parentOverlay, hoveredParentEl);
    setBoxToElement(overlay, hoveredEl);

    tooltip.innerHTML = `
    ${hoveredParentEl ? `<div class="rm-tip-block"><span class="rm-tip-label">Parent</span>${getOpeningTagHtml(hoveredParentEl)}</div>` : ''}
    <div class="rm-tip-block"><span class="rm-tip-label">Current</span>${getOpeningTagHtml(hoveredEl)}</div>
  `;
    tooltip.style.display = 'block';
    positionTooltip(lastMouseX, lastMouseY);
  }

  function getHoveredInsideRoot(x, y) {
    let el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (el === toggle || toggle.contains(el)) return null;
    if (el === menu || menu.contains(el)) return null;
    if (!root.contains(el)) return null;
    if (el === root) return null;
    return el;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        return true;
      } catch (fallbackErr) {
        return false;
      }
    }
  }

  function flashButton(text) {
    const original = active ? 'Inspector: On' : 'Inspector: Off';
    toggle.textContent = text;
    setTimeout(() => {
      toggle.textContent = original;
    }, 900);
  }

  function enable() {
    active = true;
    document.body.classList.add('rm-inspector-active');
    toggle.classList.add('rm-on');
    toggle.textContent = 'Inspector: On';
  }

  function disable() {
    active = false;
    document.body.classList.remove('rm-inspector-active');
    toggle.classList.remove('rm-on');
    toggle.textContent = 'Inspector: Off';
    hideMenu();
    clearInspector();
  }

  menu.querySelector('.rm-close').addEventListener('click', function (e) {
    e.stopPropagation();
    hideMenu();
  });

  copyCurrentBtn.addEventListener('click', async function (e) {
    e.stopPropagation();
    if (!hoveredEl) return;
    const ok = await copyText(serializeNodeRaw(hoveredEl));
    hideMenu();
    flashButton(ok ? 'Copied current!' : 'Copy failed');
  });

  copyParentBtn.addEventListener('click', async function (e) {
    e.stopPropagation();
    const target = getCopyContainer(hoveredEl);
    if (!target) return;
    const ok = await copyText(serializeNodeRaw(target));
    hideMenu();
    flashButton(ok ? (isDirectChildOfRoot(hoveredEl) ? 'Copied section!' : 'Copied parent!') : 'Copy failed');
  });

  document.addEventListener('pointermove', function (e) {
    if (!active) return;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (menu.style.display === 'block') return;

    const el = getHoveredInsideRoot(e.clientX, e.clientY);

    if (!el) {
      clearInspector();
      return;
    }

    if (el !== hoveredEl) {
      updateInspector(el);
    } else if (tooltip.style.display === 'block') {
      positionTooltip(lastMouseX, lastMouseY);
    }
  }, true);

  document.addEventListener('click', function (e) {
    if (!active) return;

    if (toggle.contains(e.target)) return;
    if (menu.contains(e.target)) return;

    const menuWasOpen = menu.style.display === 'block';

    if (menuWasOpen) {
      hideMenu();
      return;
    }

    const el = getHoveredInsideRoot(e.clientX, e.clientY);

    if (!el) {
      hideMenu();
      clearInspector();
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    updateInspector(el);
    positionMenu(e.clientX, e.clientY);
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      hideMenu();
    }
  });

  document.addEventListener('scroll', function () {
    if (!active) return;
    hideMenu();
    if (hoveredEl) updateInspector(hoveredEl);
  }, true);

  window.addEventListener('resize', function () {
    if (!active) return;
    hideMenu();
    if (hoveredEl) updateInspector(hoveredEl);
  });

  toggle.addEventListener('click', function () {
    active ? disable() : enable();
  });

  disable();
})();
