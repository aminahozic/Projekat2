window.mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    window.mouse.x = e.clientX;
    window.mouse.y = e.clientY;
});

window.keyPressed = {};

window.addEventListener('keydown', (e) => {
    window.keyPressed[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    window.keyPressed[e.code] = false;
});