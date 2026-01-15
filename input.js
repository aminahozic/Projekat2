window.mouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
    window.mouse.x = e.clientX;
    window.mouse.y = e.clientY;
});

let isGameRunning = false;

function getCanvas() {
    return document.getElementById('gameCanvas');
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
    if (e.changedTouches.length > 0) {
        window.mouse.x = e.changedTouches[0].clientX;
        window.mouse.y = e.changedTouches[0].clientY;
    }
});

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