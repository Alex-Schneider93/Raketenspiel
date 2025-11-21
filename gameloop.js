let GAMELOOPJS_SPEED = 1000 / 60;
let GAMELOOPJS_SPACE_TIMEOUT = 100;
let GAMELOOPJS_INTERVALS = [];

const GAMELOOPJS_KEY = {};

document.addEventListener('keydown', (e) => GAMELOOPJS_KEY[e.keyCode] = true);
document.addEventListener('keyup',   (e) => GAMELOOPJS_KEY[e.keyCode] = false);

function leftKeyPressed() {}
function rightKeyPressed() {}
function upKeyPressed() {}
function downKeyPressed() {}
function spaceKeyPressed() {}

function gameInterval(fn, time) {
    let i = setInterval(fn, time);
    GAMELOOPJS_INTERVALS.push(i);
    return i;
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

GAMELOOPJS_START();
function GAMELOOPJS_START() {
    let spaceLock = false;

    gameInterval(() => {
        if (GAMELOOPJS_KEY[37]) leftKeyPressed();
        if (GAMELOOPJS_KEY[39]) rightKeyPressed();
        if (GAMELOOPJS_KEY[38]) upKeyPressed();
        if (GAMELOOPJS_KEY[40]) downKeyPressed();
        if (GAMELOOPJS_KEY[32]) {
            if (!spaceLock) {
                spaceKeyPressed();
                spaceLock = true;
                setTimeout(() => spaceLock = false, GAMELOOPJS_SPACE_TIMEOUT);
            }
        }
    }, GAMELOOPJS_SPEED);
}
