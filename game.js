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
//line 106 continued in next message