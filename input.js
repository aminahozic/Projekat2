window.mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    window.mouse.x = e.clientX;
    window.mouse.y = e.clientY;
});

let canvas = null;
let isGameRunning = false;

function getCanvas() {
    if (!canvas) {
        canvas = document.getElementById('gameCanvas');
    }
    return canvas;
}

window.addEventListener('touchstart', (e) => {
    const canvasEl = getCanvas();
    if (isGameRunning && canvasEl && canvasEl.style.display !== 'none') {
        e.preventDefault();
    }
    if (e.touches.length > 0) {
        window.mouse.x = e.touches[0].clientX;
        window.mouse.y = e.touches[0].clientY;
    }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
    const canvasEl = getCanvas();
    if (isGameRunning && canvasEl && canvasEl.style.display !== 'none') {
        e.preventDefault();
    }
    if (e.touches.length > 0) {
        window.mouse.x = e.touches[0].clientX;
        window.mouse.y = e.touches[0].clientY;
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    const canvasEl = getCanvas();
    if (isGameRunning && canvasEl && canvasEl.style.display !== 'none') {
        e.preventDefault();
    }
}, { passive: false });

window.setGameRunning = (running) => {
    isGameRunning = running;
};

window.keyPressed = {};

window.addEventListener('keydown', (e) => {
    window.keyPressed[e.code] = true;
});

window.addEventListener('keyup', (e) => {
    window.keyPressed[e.code] = false;
});