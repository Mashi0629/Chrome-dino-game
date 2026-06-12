// ================================================================
//  DINO GAME — game.js
// ================================================================

// ── Canvas Setup ─────────────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');
const W      = canvas.width;
const H      = canvas.height;

// ── Layout Constants ─────────────────────────────────────────────
const DINO_W      = 44;         // dino width in pixels
const DINO_H      = 52;         // dino height in pixels
const GROUND_LINE = H - 35;     // y-pixel where ground line is drawn
const DINO_BOTTOM = GROUND_LINE; // dino feet rest here (= ground line)

// ── Physics Constants ─────────────────────────────────────────────
const GRAVITY = 0.7;    // downward pull per frame
const JUMP_VY = -14;    // upward velocity applied on jump

// ── Dino Object ──────────────────────────────────────────────────
// dino.y = y position of the BOTTOM (feet) of the dino
const dino = {
  x:        60,
  y:        DINO_BOTTOM,
  vy:       0,            // vertical velocity
  onGround: true,
  legPhase: 0             // used to animate running legs
};

// ── Game State Variables ──────────────────────────────────────────
let gameState  = 'idle';   // 'idle' | 'running' | 'dead'
let score      = 0;
let hiScore    = 0;
let speed      = 5;        // how fast obstacles scroll
let frameCount = 0;
let spawnTimer = 0;
let groundOff  = 0;        // offset for scrolling ground dashes
let animId     = null;     // requestAnimationFrame ID

// ── Scene Objects ─────────────────────────────────────────────────
let obstacles = [];
let clouds = [
  { x: 560, y: 42 },
  { x: 360, y: 58 },
  { x: 160, y: 36 }
];

// ================================================================
//  INPUT HANDLING
// ================================================================

document.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleInput();
  }
});

canvas.addEventListener('click', handleInput);

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  handleInput();
}, { passive: false });

function handleInput() {
  if (gameState === 'idle' || gameState === 'dead') {
    startGame();
  } else if (gameState === 'running' && dino.onGround) {
    // Make the dino jump
    dino.vy       = JUMP_VY;
    dino.onGround = false;
  }
}

// ================================================================
//  GAME INIT / RESET
// ================================================================

function startGame() {
  // Reset all variables
  score      = 0;
  speed      = 5;
  frameCount = 0;
  spawnTimer = 0;
  groundOff  = 0;
  obstacles  = [];
  clouds     = [
    { x: 560, y: 42 },
    { x: 360, y: 58 },
    { x: 160, y: 36 }
  ];

  // Put dino back on the ground
  dino.y        = DINO_BOTTOM;
  dino.vy       = 0;
  dino.onGround = true;
  dino.legPhase = 0;

  gameState = 'running';
  document.getElementById('message').textContent = '';

  cancelAnimationFrame(animId);
  gameLoop();
}

// ================================================================
//  SPAWN CACTUS
// ================================================================

function spawnCactus() {
  const types = [
    { w: 18, h: 40, kind: 'small'  },
    { w: 22, h: 54, kind: 'tall'   },
    { w: 42, h: 44, kind: 'double' },
  ];
  const t = types[Math.floor(Math.random() * types.length)];

  obstacles.push({
    x:    W + 20,
    y:    GROUND_LINE - t.h,   // top-left corner: cactus bottom sits on ground
    w:    t.w,
    h:    t.h,
    kind: t.kind
  });
}

// ================================================================
//  COLLISION DETECTION
// ================================================================
// Dino hitbox  → top-left: (dino.x, dino.y - DINO_H)  size: DINO_W × DINO_H
// Cactus hitbox→ top-left: (ob.x, ob.y)                size: ob.w  × ob.h

function checkCollision() {
  const pad = 7;  // forgiveness padding (makes hitbox slightly smaller)

  const dLeft   = dino.x          + pad;
  const dRight  = dino.x + DINO_W - pad;
  const dTop    = dino.y - DINO_H + pad;
  const dBottom = dino.y          - pad;

  for (const ob of obstacles) {
    const oLeft   = ob.x        + pad;
    const oRight  = ob.x + ob.w - pad;
    const oTop    = ob.y        + pad;
    const oBottom = ob.y + ob.h - pad;

    const xOverlap = dLeft < oRight  && dRight  > oLeft;
    const yOverlap = dTop  < oBottom && dBottom > oTop;

    if (xOverlap && yOverlap) return true;
  }
  return false;
}

// ================================================================
//  DRAWING FUNCTIONS
// ================================================================

// Rounded rectangle (compatible with all browsers)
function rrect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h,     x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y,         x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawDino() {
  const bx = dino.x;
  const by = dino.y - DINO_H;   // top of the dino

  // Body
  ctx.fillStyle = '#333';
  rrect(bx, by + 10, DINO_W, DINO_H - 10, 5);

  // Head bump (top-right)
  ctx.fillStyle = '#333';
  rrect(bx + DINO_W - 18, by, 18, 22, 4);

  // Eye white
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bx + DINO_W - 8, by + 7, 5, 0, Math.PI * 2);
  ctx.fill();

  // Pupil
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(bx + DINO_W - 6, by + 8, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = '#333';
  ctx.fillRect(bx + DINO_W - 2, by + 14, 9, 5);

  // Legs — animate when running, tucked when airborne
  ctx.fillStyle = '#333';
  if (dino.onGround) {
    const swing = Math.sin(dino.legPhase) * 8;
    ctx.fillRect(bx + 6,  dino.y - 12, 10, 12 + swing);
    ctx.fillRect(bx + 22, dino.y - 12, 10, 12 - swing);
  } else {
    ctx.fillRect(bx + 6,  dino.y - 10, 10, 8);
    ctx.fillRect(bx + 22, dino.y - 10, 10, 8);
  }
}

function drawCactus(ob) {
  ctx.fillStyle = '#2a7a2a';

  if (ob.kind === 'double') {
    rrect(ob.x,      ob.y,      16, ob.h,      3);  // left stem
    rrect(ob.x + 26, ob.y + 14, 16, ob.h - 14, 3);  // right stem
    ctx.fillRect(ob.x - 8,  ob.y + Math.floor(ob.h * 0.35), 12, 9); // left arm
    ctx.fillRect(ob.x + 30, ob.y + Math.floor(ob.h * 0.45), 12, 9); // right arm
  } else {
    rrect(ob.x, ob.y, ob.w, ob.h, 3);                                         // stem
    ctx.fillRect(ob.x - 8,        ob.y + Math.floor(ob.h * 0.38), 10, 9);     // left arm
    ctx.fillRect(ob.x + ob.w - 2, ob.y + Math.floor(ob.h * 0.48), 10, 9);     // right arm
  }
}

function drawCloud(x, y) {
  ctx.fillStyle = 'rgba(160,160,160,0.35)';
  ctx.beginPath(); ctx.ellipse(x,      y,      36, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x + 24, y - 8,  22, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x - 20, y - 5,  20, 10, 0, 0, Math.PI * 2); ctx.fill();
}

function drawGround() {
  // Main ground line
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_LINE);
  ctx.lineTo(W, GROUND_LINE);
  ctx.stroke();

  // Scrolling dashes below the ground line
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth   = 1;
  ctx.setLineDash([7, 9]);
  ctx.beginPath();
  for (let x = groundOff; x < W + 20; x += 40) {
    ctx.moveTo(x,      GROUND_LINE + 10);
    ctx.lineTo(x + 18, GROUND_LINE + 10);
  }
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#333';
  ctx.font      = 'bold 26px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 12);

  ctx.font      = '14px Courier New';
  ctx.fillStyle = '#777';
  ctx.fillText('Press SPACE or tap to restart', W / 2, H / 2 + 16);
  ctx.textAlign = 'left';
}

function drawIdleScreen() {
  ctx.clearRect(0, 0, W, H);
  clouds.forEach(c => drawCloud(c.x, c.y));
  drawGround();
  drawDino();

  ctx.fillStyle = '#aaa';
  ctx.font      = '14px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('Press SPACE or tap to start', W / 2, H / 2 - 20);
  ctx.textAlign = 'left';
}

// ================================================================
//  MAIN GAME LOOP
// ================================================================

function gameLoop() {
  ctx.clearRect(0, 0, W, H);

  // ── Score & speed ───────────────────────────────────────────
  frameCount++;
  score = Math.floor(frameCount / 6);
  document.getElementById('score').textContent = score;

  // Speed increases every 500 points
  speed = 5 + Math.floor(score / 500) * 0.8;

  // ── Scroll ground ───────────────────────────────────────────
  groundOff -= speed;
  if (groundOff < -40) groundOff = 0;

  // ── Scroll clouds (slow parallax) ───────────────────────────
  clouds.forEach(c => {
    c.x -= speed * 0.25;
    if (c.x < -120) c.x = W + 120;
  });

  // ── Dino physics ────────────────────────────────────────────
  if (!dino.onGround) {
    dino.vy += GRAVITY;        // pull down by gravity
    dino.y  += dino.vy;        // move feet position

    // Check if dino has landed
    if (dino.y >= DINO_BOTTOM) {
      dino.y        = DINO_BOTTOM;
      dino.vy       = 0;
      dino.onGround = true;
    }
  } else {
    dino.legPhase += 0.3;      // animate legs while running
  }

  // ── Spawn cactus ────────────────────────────────────────────
  spawnTimer++;
  const minGap = Math.max(50, 90 - Math.floor(score / 300) * 5);
  if (spawnTimer >= minGap + Math.random() * 40) {
    spawnCactus();
    spawnTimer = 0;
  }

  // Move obstacles & remove ones that scrolled off screen
  obstacles.forEach(ob => ob.x -= speed);
  obstacles = obstacles.filter(ob => ob.x > -80);

  // ── Draw scene ──────────────────────────────────────────────
  clouds.forEach(c  => drawCloud(c.x, c.y));
  drawGround();
  obstacles.forEach(ob => drawCactus(ob));
  drawDino();

  // ── Collision check ─────────────────────────────────────────
  if (checkCollision()) {
    gameState = 'dead';

    if (score > hiScore) {
      hiScore = score;
      document.getElementById('hi-score').textContent = hiScore;
    }

    drawGameOver();
    return;  // stop the loop
  }

  animId = requestAnimationFrame(gameLoop);
}

// ── Start on idle screen ─────────────────────────────────────────
drawIdleScreen();