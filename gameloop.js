let KEYS = {};

document.addEventListener("keydown", e => KEYS[e.keyCode] = true);
document.addEventListener("keyup",   e => KEYS[e.keyCode] = false);

function gameLoop(callback) {
    return setInterval(callback, 16); // ≈60 FPS
}
