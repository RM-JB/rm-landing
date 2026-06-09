(() => {
   const sections = document.querySelectorAll(".parallax");
   if (!sections.length) return;

   function updateParallax() {
      sections.forEach(section => {
         const rect = section.getBoundingClientRect();
         const viewportHeight = window.innerHeight;

         const progress =
            (viewportHeight - rect.top) /
            (viewportHeight + rect.height);

         const clamped = Math.max(0, Math.min(1, progress));

         section.style.setProperty(
            "--parallax-y",
            `${clamped * 100}%`
         );
      });

      requestAnimationFrame(updateParallax);
   }

   requestAnimationFrame(updateParallax);
})();
