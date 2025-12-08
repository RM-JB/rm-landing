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
