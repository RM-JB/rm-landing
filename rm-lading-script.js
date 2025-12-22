// Adding rm-container
document.addEventListener("DOMContentLoaded", () => {
    const landing = document.querySelector("#rm-landing");
    if (!landing) return;

    Array.from(landing.children).forEach(section => {
        // Avoid double-wrapping
        if (section.querySelector(":scope > rm-container")) return;

        const container = document.createElement("rm-container");

        // Move all existing children into rm-container
        while (section.firstChild) {
            container.appendChild(section.firstChild);
        }

        section.appendChild(container);
    });
});

// Hover
document.querySelectorAll('div > a.button').forEach(btn => {
    const div = btn.parentElement;

    if (btn.href) {
        div.style.cursor = 'pointer';

        div.addEventListener('click', (e) => {
            if (e.target === btn) return;
            window.location.href = btn.href;
        });
    }
});
