// ================================
// SPIEL INITIALISIERUNG
// ================================
const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x000000
});
document.body.appendChild(app.view);

// UI Elemente
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");

// Game Variablen
let score = 0;
let lives = 3;
let gameRunning = false;
let boss = null;
let bossSpawned = false;

const ufos = [];
const bullets = [];

// ================================
// SPIELER (RAKETE)
// ================================
const rocket = PIXI.Sprite.from("assets/rocket.png");
rocket.anchor.set(0.5);
rocket.scale.set(0.12);
app.stage.addChild(rocket);

function positionRocket() {
    rocket.x = app.renderer.width / 2;
    rocket.y = app.renderer.height - 80;
}
positionRocket();
window.addEventListener("resize", positionRocket);

// ================================
// HUD (Score + Leben)
// ================================
const hud = new PIXI.Text("Score: 0   Leben: 3", {
    fill: "#ffffff",
    fontSize: 26
});
hud.x = 20;
hud.y = 20;
app.stage.addChild(hud);

function updateHUD() {
    hud.text = `Score: ${score}   Leben: ${lives}`;
}

// ================================
// EXPLOSION ANIMATION
// ================================
function explode(x, y) {
    const boom = new PIXI.Graphics();
    let r = 5;

    const timer = setInterval(() => {
        boom.clear();
        boom.beginFill(0xff3300, 1 - r / 60);
        boom.drawCircle(x, y, r);
        boom.endFill();
        app.stage.addChild(boom);
        r += 4;
        if (r >= 60) {
            clearInterval(timer);
            app.stage.removeChild(boom);
        }
    }, 16);
}

// ================================
// BULLETS
// ================================
function shoot() {
    if (!gameRunning) return;

    const b = PIXI.Sprite.from("assets/bullet.png");
    b.anchor.set(0.5);
    b.scale.set(0.12);
    b.x = rocket.x;
    b.y = rocket.y - 30;
    b.speed = 10;

    bullets.push(b);
    app.stage.addChild(b);
}

function spaceKeyPressed() {
    shoot();
}

// ================================
// GEGNER (UFOs)
// ================================
function spawnUFO() {
    if (!gameRunning) return;

    const u = PIXI.Sprite.from("assets/ufo1.png");
    u.anchor.set(0.5);
    u.scale.set(0.15);
    u.x = random(40, app.renderer.width - 40);
    u.y = -50;
    u.speed = 2 + score / 20;

    ufos.push(u);
    app.stage.addChild(u);
}

setInterval(spawnUFO, 700);

// ================================
// BOSS UFO
// ================================
function spawnBoss() {
    boss = PIXI.Sprite.from("assets/ufo2.png");
    boss.anchor.set(0.5);
    boss.scale.set(0.35);
    boss.hp = 30;
    boss.x = app.renderer.width / 2;
    boss.y = 160;
    app.stage.addChild(boss);
}

function updateBoss() {
    if (!boss) return;

    boss.x += Math.sin(Date.now() / 500) * 3;

    bullets.forEach((b) => {
        if (isColliding(b, boss)) {
            explode(b.x, b.y);
            bullets.splice(bullets.indexOf(b), 1);
            app.stage.removeChild(b);

            boss.hp--;
            if (boss.hp <= 0) {
                explode(boss.x, boss.y);
                app.stage.removeChild(boss);
                boss = null;
                score += 40;
                updateHUD();
            }
        }
    });
}

// ================================
// KOLLISION
// ================================
function isColliding(a, b) {
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
app.ticker.add(() => {
    if (!gameRunning) return;

    // Bullets bewegen
    bullets.forEach((b) => {
        b.y -= b.speed;
        if (b.y < -20) {
            bullets.splice(bullets.indexOf(b), 1);
            app.stage.removeChild(b);
        }
    });

    // UFO bewegen + Kollisionen
    ufos.forEach((u) => {
        u.y += u.speed;

        // Bullet trifft UFO
        bullets.forEach((b) => {
            if (isColliding(b, u)) {
                explode(u.x, u.y);
                app.stage.removeChild(u);
                app.stage.removeChild(b);
                ufos.splice(ufos.indexOf(u), 1);
                bullets.splice(bullets.indexOf(b), 1);

                score++;
                updateHUD();
            }
        });

        // UFO trifft Spieler
        if (isColliding(u, rocket)) {
            explode(rocket.x, rocket.y);
            lives--;
            updateHUD();

            if (lives <= 0) {
                gameOver();
            }

            app.stage.removeChild(u);
            ufos.splice(ufos.indexOf(u), 1);
        }

        // unten raus
        if (u.y > app.renderer.height + 50) {
            app.stage.removeChild(u);
            ufos.splice(ufos.indexOf(u), 1);
        }
    });

    // Boss logik
    if (score >= 10 && !bossSpawned) {
        spawnBoss();
        bossSpawned = true;
    }
    updateBoss();
});

// ================================
// PC STEUERUNG
// ================================
function leftKeyPressed()  { rocket.x -= 10; }
function rightKeyPressed() { rocket.x += 10; }
function upKeyPressed()    { rocket.y -= 10; }
function downKeyPressed()  { rocket.y += 10; }

// ================================
// TOUCH CONTROLS
// ================================
document.getElementById("btnLeft").addEventListener("touchstart", () => rocket.x -= 20);
document.getElementById("btnRight").addEventListener("touchstart", () => rocket.x += 20);
document.getElementById("btnUp").addEventListener("touchstart", () => rocket.y -= 20);
document.getElementById("btnDown").addEventListener("touchstart", () => rocket.y += 20);
document.getElementById("btnFire").addEventListener("touchstart", shoot);

// ================================
// START & GAME OVER
// ================================
startBtn.onclick = () => {
    overlay.style.display = "none";
    startGame();
};

function startGame() {
    score = 0;
    lives = 3;
    bossSpawned = false;
    updateHUD();
    positionRocket();
    gameRunning = true;
}

function gameOver() {
    gameRunning = false;

    overlay.innerHTML = `
        <h1 style="font-size:48px;">GAME OVER</h1>
        <div id="retryBtn" style="background:#ff3333;padding:20px 40px;border-radius:15px;font-size:32px;cursor:pointer;">
            🔁 Erneut spielen
        </div>
    `;

    overlay.style.display = "flex";

    document.getElementById("retryBtn").onclick = () => {
        overlay.innerHTML = `
            <h1 style="font-size:48px;">SPACE ATTACK</h1>
            <div id="startBtn">▶ Spiel Starten</div>
        `;
        document.getElementById("startBtn").onclick = () => {
            overlay.style.display = "none";
            startGame();
        };
    };
}
