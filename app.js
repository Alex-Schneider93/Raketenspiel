// ================================
// SETUP
// ================================
const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x000000
});
document.body.appendChild(app.view);

document.addEventListener("touchstart", e => e.preventDefault(), { passive: false });

// ================================
// GAME STATE
// ================================
let running = false;
let score = 0;
let lives = 3;
let boss = null;
let bossSpawned = false;

let bullets = [];
let ufos = [];

// ================================
// OVERLAY
// ================================
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");

// ================================
// PLAYER
// ================================
const rocket = PIXI.Sprite.from("assets/rocket.png");
rocket.anchor.set(0.5);
rocket.scale.set(0.12);
app.stage.addChild(rocket);

function placeRocket() {
    rocket.x = app.renderer.width / 2;
    rocket.y = app.renderer.height - 80;
}
placeRocket();
window.addEventListener("resize", placeRocket);

// ================================
// HUD
// ================================
const hud = new PIXI.Text("Score: 0   Leben: 3", {
    fill: "#fff",
    fontSize: 26
});
hud.x = 20;
hud.y = 20;
app.stage.addChild(hud);

function updateHUD() {
    hud.text = `Score: ${score}   Leben: ${lives}`;
}

// ================================
// EXPLOSION
// ================================
function explosion(x, y) {
    const g = new PIXI.Graphics();
    let r = 1;

    const fx = setInterval(() => {
        g.clear();
        g.beginFill(0xff3300, 1 - r / 40);
        g.drawCircle(x, y, r);
        g.endFill();

        app.stage.addChild(g);

        r += 3;
        if (r > 40) {
            clearInterval(fx);
            app.stage.removeChild(g);
        }
    }, 16);
}

// ================================
// SHOOT
// ================================
function shoot() {
    if (!running) return;

    const b = PIXI.Sprite.from("assets/bullet.png");
    b.anchor.set(0.5);
    b.scale.set(0.12);
    b.x = rocket.x;
    b.y = rocket.y - 25;
    b.speed = 10;

    bullets.push(b);
    app.stage.addChild(b);
}

// ================================
// UFO SPAWN
// ================================
function spawnUFO() {
    if (!running) return;

    const u = PIXI.Sprite.from("assets/ufo1.png");
    u.anchor.set(0.5);
    u.scale.set(0.15);
    u.x = Math.random() * (app.renderer.width - 80) + 40;
    u.y = -40;
    u.speed = 2 + score * 0.05;

    ufos.push(u);
    app.stage.addChild(u);
}

setInterval(spawnUFO, 800);

// ================================
// BOSS
// ================================
function spawnBoss() {
    boss = PIXI.Sprite.from("assets/ufo2.png");
    boss.anchor.set(0.5);
    boss.scale.set(0.35);
    boss.x = app.renderer.width / 2;
    boss.y = 150;
    boss.hp = 25;
    app.stage.addChild(boss);
}

function updateBoss() {
    if (!boss) return;

    boss.x += Math.sin(Date.now() / 500) * 3;

    let removeList = [];

    bullets.forEach((b) => {
        if (collide(b, boss)) {
            explosion(b.x, b.y);
            removeList.push(b);
            boss.hp--;

            if (boss.hp <= 0) {
                explosion(boss.x, boss.y);
                app.stage.removeChild(boss);
                boss = null;
                score += 40;
                updateHUD();
            }
        }
    });

    removeList.forEach(b => {
        app.stage.removeChild(b);
        bullets.splice(bullets.indexOf(b), 1);
    });
}

// ================================
// COLLISION
// ================================
function collide(a, b) {
    const A = a.getBounds();
    const B = b.getBounds();
    return A.x < B.x + B.width &&
           A.x + A.width > B.x &&
           A.y < B.y + B.height &&
           A.y + A.height > B.y;
}

// ================================
// GAME LOOP
// ================================
setInterval(() => {

    if (!running) return;

    // movement keys
    if (KEYS[37]) rocket.x -= 8;
    if (KEYS[39]) rocket.x += 8;
    if (KEYS[38]) rocket.y -= 8;
    if (KEYS[40]) rocket.y += 8;
    if (KEYS[32]) shoot();

    // bullets
    bullets.forEach((b) => {
        b.y -= b.speed;
    });

    bullets = bullets.filter(b => {
        if (b.y < -50) {
            app.stage.removeChild(b);
            return false;
        }
        return true;
    });

    // ufos
    ufos.forEach((u) => {
        u.y += u.speed;
    });

    let newUFOs = [];

    ufos.forEach((u) => {
        // collision bullet -> ufo
        let hit = false;
        bullets.forEach((b) => {
            if (collide(b, u)) {
                hit = true;
                explosion(u.x, u.y);
                app.stage.removeChild(b);
            }
        });

        bullets = bullets.filter(b => !collide(b, u));

        if (hit) {
            app.stage.removeChild(u);
            score++;
            updateHUD();
            return;
        }

        // collision ufo -> rocket
        if (collide(u, rocket)) {
            explosion(rocket.x, rocket.y);
            app.stage.removeChild(u);
            lives--;
            updateHUD();
            if (lives <= 0) gameOver();
            return;
        }

        // still alive? keep it
        if (u.y < app.renderer.height + 50) {
            newUFOs.push(u);
        } else {
            app.stage.removeChild(u);
        }
    });

    ufos = newUFOs;

    // BOSS
    if (!bossSpawned && score >= 15) {
        spawnBoss();
        bossSpawned = true;
    }

    updateBoss();

}, 16);

// ================================
// TOUCH BUTTONS
// ================================
document.getElementById("btnLeft").addEventListener("touchstart", () => rocket.x -= 18);
document.getElementById("btnRight").addEventListener("touchstart", () => rocket.x += 18);
document.getElementById("btnUp").addEventListener("touchstart", () => rocket.y -= 18);
document.getElementById("btnDown").addEventListener("touchstart", () => rocket.y += 18);
document.getElementById("btnFire").addEventListener("touchstart", shoot);

// ================================
// START & GAME OVER
// ================================
startBtn.onclick = () => {
    overlay.style.display = "none";
    startGame();
};

function startGame() {
    running = true;
    score = 0;
    lives = 3;
    bullets = [];
    ufos = [];
    boss = null;
    bossSpawned = false;
    updateHUD();
    placeRocket();
}

function gameOver() {
    running = false;

    overlay.innerHTML = `
        <h1 style="font-size:50px;">GAME OVER</h1>
        <div id="retryBtn" style="background:#ff3333;padding:18px 40px;font-size:32px;border-radius:15px;">🔁 Erneut spielen</div>
    `;
    overlay.style.display = "flex";

    document.getElementById("retryBtn").onclick = () => location.reload();
}
