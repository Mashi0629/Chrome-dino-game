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
 