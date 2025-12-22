// Hotspots
  document.querySelectorAll('.lp-module-06').forEach(hotspot => {
      const divs = hotspot.querySelectorAll('button + div');

      const slugify = str =>
          str.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');

      let lastFocused = null;

      divs.forEach((div, index) => {
          const h1 = div.querySelector('h1');
          const p = div.querySelector('p');
          const closeBtn = div.querySelector('button');
          const headingID = `heading-${slugify(h1.textContent)}`;
          const descID = `desc-${slugify(h1.textContent)}`;
          const popupID = `popup-${slugify(h1.textContent)}`;

          h1.id = headingID;
          if (p) p.id = descID;
          div.id = popupID;

          div.setAttribute('role', 'dialog');
          div.setAttribute('aria-modal', 'true');
          div.setAttribute('aria-labelledby', headingID);
          if (p) div.setAttribute('aria-describedby', descID);

          Object.assign(div.style, { opacity: 0, display: 'none', zIndex: 0 });

          const button = div.previousElementSibling;
          button.setAttribute('aria-label', `${h1.textContent} hotspot`);
          button.setAttribute('aria-controls', popupID);

          button.addEventListener('click', e => {
              e.stopPropagation();
              lastFocused = e.target;

              const visible = div.style.display === 'block';
              hideAll(visible ? null : div);
              if (!visible) {
                  Object.assign(div.style, { display: 'block', zIndex: 1000 });
                  setTimeout(() => (div.style.opacity = 1), 10);
                  closeBtn.focus();
              }
          });

          closeBtn.setAttribute('aria-label', `Close popup for ${h1.textContent}`);
          closeBtn.addEventListener('click', e => {
              e.stopPropagation();
              div.style.opacity = 0;
              setTimeout(() => Object.assign(div.style, { display: 'none', zIndex: 0 }), 250);
              if (lastFocused) lastFocused.focus();
          });
      });

      const hideAll = (except) => {
          hotspot.querySelectorAll('div[role="dialog"]').forEach(d => {
              if (d !== except) {
                  d.style.opacity = 0;
                  setTimeout(() => Object.assign(d.style, { display: 'none', zIndex: 0 }), 250);
              }
          });
      };

      document.addEventListener('keydown', e => {
          if (e.key === 'Escape') {
              hideAll();
              if (lastFocused) lastFocused.focus();
          }
      });

      hotspot.addEventListener('click', () => hideAll());
  });
  
  
  // Sliders
  document.addEventListener("DOMContentLoaded", () => {
      const modules = document.querySelectorAll(".lp-module-07, .lp-module-08, .lp-module-09");

      modules.forEach(article => {
          const is09 = article.classList.contains("lp-module-09");
          const is08 = article.classList.contains("lp-module-08");
          const slides = article.querySelectorAll(".slide");
          const heading = article.querySelector("h1");
          if (!heading || !slides.length) return;

          let currentIndex = 0;
          const bg = document.createElement("div");
          bg.className = "bg-image";
          heading.after(bg);

          const btns = !is09 ? document.createElement("div") : null;
          if (btns) {
              btns.className = "buttons";
              bg.after(btns);
          }

          const dots = is09 ? document.createElement("div") : null;
          if (dots) {
              dots.className = "dots";
              (btns || bg).after(dots);
          }

          const nav = (dir, handler) => {
              const btn = document.createElement("button");
              btn.className = `nav-arrow ${dir}`;
              btn.setAttribute("aria-label", `${dir === "left" ? "Previous" : "Next"} slide`);
              btn.textContent = dir === "left" ? "←" : "→";
              btn.onclick = handler;
              article.appendChild(btn);
          };

          const activate = i => {
              slides.forEach(s => s.classList.remove("active"));
              slides[i].classList.add("active");
              slides.forEach(s => s.setAttribute("aria-hidden", "true"));
              slides[i].setAttribute("aria-hidden", "false");
              const bgUrl = slides[i].getAttribute("data-bg");
              if (bgUrl) bg.style.backgroundImage = `url("${bgUrl}")`;

              if (btns) btns.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
              if (dots) dots.querySelectorAll("button").forEach((d, j) => d.classList.toggle("active-dot", j === i));
          };

          slides.forEach((slide, i) => {
              slide.id = `slide-${i}`;
              slide.setAttribute("role", "tabpanel");
              slide.setAttribute("aria-hidden", "true");

              const h2 = slide.querySelector("h2");

              if (btns && h2) {
                  const b = document.createElement("button");
                  b.textContent = h2.textContent;
                  b.setAttribute("role", "tab");
                  b.setAttribute("aria-controls", slide.id);
                  b.setAttribute("aria-pressed", "false");
                  b.onclick = () => (currentIndex = i, activate(i));
                  btns.appendChild(b);
              }

              if (dots) {
                  const d = document.createElement("button");
                  d.className = "dot";
                  d.setAttribute("aria-label", `Go to slide ${i + 1}`);
                  d.onclick = () => (currentIndex = i, activate(i));
                  dots.appendChild(d);
              }
          });

          activate(0);

          if (is08 || is09) {
              nav("left", () => {
                  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                  activate(currentIndex);
              });
              nav("right", () => {
                  currentIndex = (currentIndex + 1) % slides.length;
                  activate(currentIndex);
              });
          }
      });
  });
