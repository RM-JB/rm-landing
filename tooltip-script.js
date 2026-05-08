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

function formatHTML(html) {
const tab = '  ';
const template = document.createElement('template');
template.innerHTML = html.trim();

const inlineTags = new Set([
  'a', 'span', 'strong', 'em', 'b', 'i', 'small', 'button',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'
]);

const voidTags = new Set([
  'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base',
  'col', 'embed', 'param', 'source', 'track', 'wbr'
]);

function attrsToString(el) {
  return [...el.attributes]
    .map(attr => `${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`)
    .join(' ');
}

function openingTag(el) {
  const attrs = attrsToString(el);
  return attrs ? `<${el.tagName.toLowerCase()} ${attrs}>` : `<${el.tagName.toLowerCase()}>`;
}

function formatNode(node, level = 0) {
  if (node.nodeType === 3) {
    return node.textContent.trim();
  }

  if (node.nodeType !== 1) return '';

  const tag = node.tagName.toLowerCase();
  const indent = tab.repeat(level);
  const open = openingTag(node);

  if (voidTags.has(tag)) {
    return `${indent}${open}`;
  }

  const children = [...node.childNodes].filter(child => {
    return child.nodeType !== 3 || child.textContent.trim();
  });

  const close = `</${tag}>`;

  // Keep simple text-based elements on one line
  if (
    inlineTags.has(tag) &&
    children.length === 1 &&
    children[0].nodeType === 3
  ) {
    return `${indent}${open}${children[0].textContent.trim()}${close}`;
  }

  if (!children.length) {
    return `${indent}${open}${close}`;
  }

  const inner = children
    .map(child => formatNode(child, level + 1))
    .filter(Boolean)
    .join('\n');

  return `${indent}${open}\n${inner}\n${indent}${close}`;
}

return [...template.content.childNodes]
  .map(node => formatNode(node, 0))
  .filter(Boolean)
  .join('\n')
  .trim();
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

// ================= YOUTUBE SPECIAL COPY =================
function isYtTarget(el) {
  if (!el || el === landing) return false;

  if (el.classList?.contains('yt-wrapper')) return true;

  if (el.tagName?.toLowerCase() === 'section') {
    return !!el.querySelector(':scope > .yt-wrapper, :scope > .wrapper > .yt-wrapper');
  }

  return false;
}

function getYtSectionTarget(el) {
  if (el.classList?.contains('yt-wrapper')) {
    return el.closest('section') || el;
  }

  if (el.tagName?.toLowerCase() === 'section') {
    return el;
  }

  return el;
}

function getYtWrapperFromTarget(el) {
  const target = getYtSectionTarget(el);

  if (target.classList?.contains('yt-wrapper')) {
    return target;
  }

  return target.querySelector(':scope > .yt-wrapper, :scope > .wrapper > .yt-wrapper');
}

function getYtCopyHTML(el) {
  const section = getYtSectionTarget(el);
  const wrapper = getYtWrapperFromTarget(el);
  const videoId = wrapper?.dataset.videoId || '';

  const sectionClone = section.tagName?.toLowerCase() === 'section'
    ? section.cloneNode(false)
    : document.createElement('section');

  sectionClone.style?.removeProperty('outline');
  sectionClone.style?.removeProperty('outline-offset');
  sectionClone.style?.removeProperty('cursor');

  if (!sectionClone.getAttribute('style')?.trim()) {
    sectionClone.removeAttribute('style');
  }

  [...sectionClone.attributes].forEach(attr => {
    sectionClone.setAttribute(attr.name, decodeHTML(attr.value));
  });

  const opening = sectionClone.outerHTML.replace(`</${sectionClone.tagName.toLowerCase()}>`, '');

  return `${opening}
<div class="yt-wrapper" data-video-id="${decodeHTML(videoId)}">
<div class="yt-overlay">
    <button class="yt-play-btn" aria-label="Play video"></button>
</div>

<div class="yt-player"></div>
</div>
</section>`;
}

// ================= SLIDER SPECIAL COPY =================
function isSliderTarget(el) {
  return !!el?.closest?.('section.slider');
}

function cleanSliderClone(slider) {
  const clone = slider.cloneNode(false);

  clone.removeAttribute('data-slider-built');

  clone.style?.removeProperty('outline');
  clone.style?.removeProperty('outline-offset');
  clone.style?.removeProperty('cursor');

  if (!clone.getAttribute('style')?.trim()) {
    clone.removeAttribute('style');
  }

  [...clone.attributes].forEach(attr => {
    clone.setAttribute(attr.name, decodeHTML(attr.value));
  });

  return clone;
}

function getOriginalSliderHTML(el) {
  const slider = el.closest('section.slider');
  if (!slider) return '';

  const clone = cleanSliderClone(slider);

  [...slider.children].forEach(child => {
    if (
      child.classList?.contains('rm-slider-topbar') ||
      child.classList?.contains('rm-slider-dots')
    ) {
      return;
    }

    if (child.classList?.contains('rm-slider-track')) {
      const slides = child.querySelectorAll(':scope > .rm-slider-slide');

      slides.forEach(slide => {
        const slideClone = slide.cloneNode(true);

        slideClone.classList.remove('rm-slider-slide');
        slideClone.removeAttribute('data-index');
        slideClone.removeAttribute('style');

        const all = [slideClone, ...slideClone.querySelectorAll('*')];

        all.forEach(node => {
          node.style?.removeProperty('outline');
          node.style?.removeProperty('outline-offset');
          node.style?.removeProperty('cursor');

          if (!node.getAttribute('style')?.trim()) {
            node.removeAttribute('style');
          }

          [...node.attributes].forEach(attr => {
            node.setAttribute(attr.name, decodeHTML(attr.value));
          });
        });

        clone.appendChild(slideClone);
      });

      return;
    }

    const extraClone = cleanClone(child);
    clone.appendChild(extraClone);
  });

  return clone.outerHTML.trim().replace(/&amp;/g, '&');
}

function findAllowedTarget(target) {
  if (!target || target === landing || !landing.contains(target)) return null;

  let el = target.nodeType === 1 ? target : target.parentElement;

  const slider = el.closest?.('section.slider');
  if (slider && landing.contains(slider)) return slider;

  const ytWrapper = el.closest?.('.yt-wrapper');
  if (ytWrapper && landing.contains(ytWrapper)) return ytWrapper;

  while (el && el !== landing) {
    if (isYtTarget(el)) return el;

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

  box.style.left = `${x}px`;
  box.style.top = `${y}px`;

  const rect = box.getBoundingClientRect();

  if (rect.right > window.innerWidth - 8) {
    x = e.clientX - rect.width - offset;
  }

  if (rect.bottom > window.innerHeight - 8) {
    y = e.clientY - rect.height - offset;
  }

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
  if (isYtTarget(el)) return true;
  if (isSliderTarget(el)) return true;

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
    node.style?.removeProperty('outline');
    node.style?.removeProperty('outline-offset');
    node.style?.removeProperty('cursor');

    if (!node.getAttribute('style')?.trim()) {
      node.removeAttribute('style');
    }

    [...node.attributes].forEach(attr => {
      node.setAttribute(attr.name, decodeHTML(attr.value));
    });
  });

  return clone;
}

function getOuterHTML(el) {
  if (isYtTarget(el)) return formatHTML(getYtCopyHTML(el));
  if (isSliderTarget(el)) return formatHTML(getOriginalSliderHTML(el));

  return formatHTML(cleanClone(el).outerHTML.trim().replace(/&amp;/g, '&'));
}

function getElementWithoutChildren(el) {
  if (isYtTarget(el)) return formatHTML(getYtCopyHTML(el));
  if (isSliderTarget(el)) return formatHTML(getOriginalSliderHTML(el));

  const clone = el.cloneNode(false);

  clone.style?.removeProperty('outline');
  clone.style?.removeProperty('outline-offset');
  clone.style?.removeProperty('cursor');

  if (!clone.getAttribute('style')?.trim()) {
    clone.removeAttribute('style');
  }

  [...clone.attributes].forEach(attr => {
    clone.setAttribute(attr.name, decodeHTML(attr.value));
  });

  return formatHTML(clone.outerHTML.trim().replace(/&amp;/g, '&'));
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
    ${
      lowest
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



// CLASS ADDER
// Inject styles
const style = document.createElement('style');
style.textContent = `
  #theme-switcher {
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 10px;
    backdrop-filter: blur(6px);
  }

  #theme-switcher button {
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    color: white;
    background: #444;
    transition: background 0.2s ease;
  }

  #theme-switcher button:hover {
    background: #555;
  }
`;
document.head.appendChild(style);

// Inject HTML
const switcher = document.createElement('div');
switcher.id = 'theme-switcher';

switcher.innerHTML = `
  <button data-class="">Normal</button>
  <button data-class="tusk">.tusk</button>
  <button data-class="msr">.msr</button>
`;

document.body.appendChild(switcher);

// Button functionality
const landing = document.querySelector('main#rm-landing');
const buttons = switcher.querySelectorAll('button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove all classes
    landing.className = '';

    // Add selected class
    const newClass = button.dataset.class;
    if (newClass) {
      landing.classList.add(newClass);
    }
  });
});

//CODE COPIER AT BOTTOM
document.addEventListener("DOMContentLoaded", function () {
  const main = document.querySelector("#rm-landing");
  if (!main) return;

  // Load Prism CSS
  const prismCss = document.createElement("link");
  prismCss.rel = "stylesheet";
  prismCss.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css";
  document.head.appendChild(prismCss);

  // Create section
  const section = document.createElement("section");
  section.id = "instructions";
  section.style.fontFamily = "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace";
  section.style.fontSize = "1.25em";

  section.innerHTML = `
    <div id="codeWrapper" style="position: relative;">
      
      <button id="copyBtn">Copy</button>

      <pre style="margin:0;">
        <code class="language-html" id="codeBlock"></code>
      </pre>
    </div>

    <style>
      #codeWrapper {
        border-radius: 0.5rem;
        overflow: hidden;
        width: 70%;
        margin-inline: auto;
        min-width: 30px;
      }

      #copyBtn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(0,0,0,0.75);
        color: white;
        border: none;
        border-radius: 0.4rem;
        padding: 0.3rem 0.6rem;
        font-size: 2rem;
        cursor: pointer;
        transition: background 0.2s, opacity 0.2s;
        z-index: 2;
      }

      #copyBtn:hover {
        background: black;
      }

      #copyBtn:active {
        opacity: 0.6;
      }

      #instructions pre {
        padding: 1rem;
        overflow-x: auto;
      }
    </style>
  `;

  // Insert after main
  main.insertAdjacentElement("afterend", section);

  // Code content
  const code = `
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-landing.css">
  <script src="https://cdn.jsdelivr.net/gh/RM-JB/rm-landing@main/rm-landing-script.js"><\/script>
  <main id="rm-landing">

    <!-- Everything goes inside here -->

  </main>`;

  const codeBlock = document.getElementById("codeBlock");
  codeBlock.textContent = code;

  // Copy logic
  const copyBtn = document.getElementById("copyBtn");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(code);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch (err) {
      copyBtn.textContent = "Failed";
    }
  });

  // Load Prism JS
  const prismScript = document.createElement("script");
  prismScript.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js";
  prismScript.onload = function () {
    if (window.Prism) Prism.highlightAll();
  };
  document.body.appendChild(prismScript);
});
