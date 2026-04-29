(() => {
  const sliders = document.querySelectorAll("#rm-landing .slider");
  if (!sliders.length) return;

  sliders.forEach(slider => {
    if (slider.dataset.sliderBuilt === "true") return;
    slider.dataset.sliderBuilt = "true";

    const heading = slider.querySelector(":scope > h1");
    const slides = Array.from(slider.children).filter(el => el.dataset.bg);

    if (!slides.length) return;

    const showTabs = slider.dataset.buttons === "true";
    const showDots = slider.dataset.dots === "true";

    let tabs = [];
    let dots = [];

    const topbar = document.createElement("div");
    topbar.className = "rm-slider-topbar";

    if (showTabs) {
      if (heading) {
        heading.classList.add("rm-slider-heading");
        slider.insertBefore(heading, slider.firstChild);
      }

      const tabWrap = document.createElement("div");
      tabWrap.className = "rm-slider-tabs";

      slides.forEach((slide, index) => {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "rm-slider-tab";
        tab.textContent = slide.dataset.title || `Slide ${index + 1}`;
        tab.setAttribute("aria-label", `Go to slide ${index + 1}`);
        tab.addEventListener("click", () => goToSlide(index));

        tabs.push(tab);
        tabWrap.appendChild(tab);
      });

      topbar.appendChild(tabWrap);
    } else if (heading) {
      topbar.appendChild(heading);
    } else {
      topbar.appendChild(document.createElement("div"));
    }

    const arrowWrap = document.createElement("div");
    arrowWrap.className = "rm-slider-arrow-wrap";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "rm-slider-arrow rm-slider-prev";
    prevBtn.innerHTML = "&#8592;";
    prevBtn.setAttribute("aria-label", "Previous slide");

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "rm-slider-arrow rm-slider-next";
    nextBtn.innerHTML = "&#8594;";
    nextBtn.setAttribute("aria-label", "Next slide");

    arrowWrap.append(prevBtn, nextBtn);
    topbar.appendChild(arrowWrap);
    slider.appendChild(topbar);

    const track = document.createElement("div");
    track.className = "rm-slider-track";

    slides.forEach((slide, index) => {
      slide.classList.add("rm-slider-slide");
      slide.dataset.index = index;

      if (slide.dataset.bg) {
        slide.style.backgroundImage = `url("${slide.dataset.bg}")`;
      }

      track.appendChild(slide);
    });

    slider.appendChild(track);

    if (showDots) {
      const dotWrap = document.createElement("div");
      dotWrap.className = "rm-slider-dots";

      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "rm-slider-dot";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => goToSlide(index));

        dots.push(dot);
        dotWrap.appendChild(dot);
      });

      slider.appendChild(dotWrap);
    }

    function getActiveIndex() {
      if (track.scrollLeft <= 2) return 0;

      const center = track.getBoundingClientRect().left + track.clientWidth / 2;

      let closest = 0;
      let dist = Infinity;

      slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const slideCenter = rect.left + rect.width / 2;
        const d = Math.abs(center - slideCenter);

        if (d < dist) {
          dist = d;
          closest = index;
        }
      });

      return closest;
    }

    function goToSlide(index) {
      const safeIndex = Math.max(0, Math.min(slides.length - 1, index));
      const slide = slides[safeIndex];
      if (!slide) return;

      const left =
        safeIndex === 0
          ? 0
          : slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;

      track.scrollTo({
        left,
        behavior: "smooth"
      });
    }

    function updateControls() {
      const active = getActiveIndex();
      const max = track.scrollWidth - track.clientWidth;

      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max - 2;

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;

      tabs.forEach((tab, index) => {
        tab.setAttribute("aria-current", index === active ? "true" : "false");
      });

      dots.forEach((dot, index) => {
        dot.setAttribute("aria-current", index === active ? "true" : "false");
      });
    }

    prevBtn.addEventListener("click", () => {
      goToSlide(getActiveIndex() - 1);
    });

    nextBtn.addEventListener("click", () => {
      goToSlide(getActiveIndex() + 1);
    });

    let ticking = false;

    track.addEventListener(
      "scroll",
      () => {
        if (ticking) return;

        requestAnimationFrame(() => {
          updateControls();
          ticking = false;
        });

        ticking = true;
      },
      { passive: true }
    );

    window.addEventListener("resize", updateControls);

    requestAnimationFrame(updateControls);
  });
})();