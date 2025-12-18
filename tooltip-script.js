document.addEventListener("DOMContentLoaded", () => {
  const selector = `
    #rm-landing :is(section, header, nav),
    #rm-landing rm-container article
  `;

  let enabled = false;
  let activeEl = null;

  let originalStyleAttr = "";
  let originalOutline = "";
  let originalOutlineOffset = "";
  let originalCursor = "";

  const tooltip = document.createElement("div");
  tooltip.id = "rm-hover-inspector";
  document.body.appendChild(tooltip);

  const toggleBtn = document.createElement("button");
  toggleBtn.id = "rm-inspector-toggle";
  toggleBtn.textContent = "Inspector OFF";
  document.body.appendChild(toggleBtn);

  function updateButton() {
    toggleBtn.textContent = enabled ? "Inspector ON" : "Inspector OFF";
    toggleBtn.classList.toggle("active", enabled);
  }

  /* ---------- COPY TEXT (SAME LINE) ---------- */
  function getCopyText() {
    if (!activeEl) return "";

    const parts = [];

    if (activeEl.classList.length) {
      parts.push(`class="${[...activeEl.classList].join(" ")}"`);
    }

    if (originalStyleAttr) {
      parts.push(`style="${originalStyleAttr}"`);
    }

    return parts.join(" ");
  }

  /* ---------- TOOLTIP CONTENT ---------- */
  function formatInfo() {
    const tag = activeEl.tagName.toLowerCase();
    const rows = [];

    rows.push(`<span class="tag">&lt;${tag}</span>`);

    let hasAttrs = false;

    if (activeEl.classList.length) {
      hasAttrs = true;
      rows.push(
        `  <span class="attr">class</span>=` +
        `<span class="quote">"</span>` +
        `<span class="value">${[...activeEl.classList].join(" ")}</span>` +
        `<span class="quote">"</span>`
      );
    }

    if (originalStyleAttr) {
      hasAttrs = true;
      rows.push(
        `  <span class="attr">style</span>=` +
        `<span class="quote">"</span>` +
        `<span class="value">${originalStyleAttr}</span>` +
        `<span class="quote">"</span>`
      );
    }

    if (!hasAttrs) {
      rows.push(`  <span class="muted">No added styles or classes</span>`);
    }

    rows.push(`<span class="tag">&gt;</span>`);
    return rows.join("\n");
  }

  function applyOutline(el) {
    originalStyleAttr = el.getAttribute("style") || "";
    originalOutline = el.style.outline || "";
    originalOutlineOffset = el.style.outlineOffset || "";

    el.style.outline = "2px dashed #7db542";
    el.style.outlineOffset = "-2px";
  }

  function restoreOutline(el) {
    el.style.outline = originalOutline;
    el.style.outlineOffset = originalOutlineOffset;

    if (originalStyleAttr) el.setAttribute("style", originalStyleAttr);
    else el.removeAttribute("style");

    originalStyleAttr = "";
  }

  function enableInspector() {
    enabled = true;
    originalCursor = document.body.style.cursor;
    document.body.style.cursor = "crosshair";
    updateButton();
  }

  function disableInspector() {
    enabled = false;
    tooltip.style.display = "none";
    document.body.style.cursor = originalCursor || "";

    if (activeEl) {
      restoreOutline(activeEl);
      activeEl = null;
    }

    updateButton();
  }

  toggleBtn.addEventListener("click", () => {
    enabled ? disableInspector() : enableInspector();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      enabled ? disableInspector() : enableInspector();
    }
  });

  document.addEventListener("mouseover", (e) => {
    if (!enabled) return;

    const target = e.target.closest(selector);
    if (!target || target === activeEl) return;

    if (activeEl) restoreOutline(activeEl);

    activeEl = target;
    applyOutline(activeEl);

    tooltip.innerHTML = formatInfo();
    tooltip.style.display = "block";
  });

  document.addEventListener("mousemove", (e) => {
    if (!enabled || !activeEl) return;
    tooltip.style.left = e.clientX + 14 + "px";
    tooltip.style.top = e.clientY + 14 + "px";
  });

  document.addEventListener("mouseout", (e) => {
    if (!enabled || !activeEl) return;

    if (!e.relatedTarget || !activeEl.contains(e.relatedTarget)) {
      restoreOutline(activeEl);
      activeEl = null;
      tooltip.style.display = "none";
    }
  });

  /* ---------- CLICK TO COPY + OVERLAY ---------- */
  document.addEventListener("click", async (e) => {
    if (!enabled || !activeEl) return;

    const target = e.target.closest(selector);
    if (target !== activeEl) return;

    const text = getCopyText();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      tooltip.classList.add("copied");
      setTimeout(() => tooltip.classList.remove("copied"), 700);
    } catch (err) {
      console.warn("Copy failed", err);
    }
  });

  updateButton();
});
