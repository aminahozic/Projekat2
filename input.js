window.mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    window.mouse.x = e.clientX;
    window.mouse.y = e.clientY;
});

window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        window.mouse.x = e.touches[0].clientX;
        window.mouse.y = e.touches[0].clientY;
    }
});

window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
        window.mouse.x = e.touches[0].clientX;
        window.mouse.y = e.touches[0].clientY;
    }
});

window.addEventListener('touchend', (e) => {
    e.preventDefault();
});

window.keyPressed = {};

window.addEventListener('keydown', (e) => {
    window.keyPressed[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    window.keyPressed[e.code] = false;
});