//  All tunable numbers live here.
//  Change a value once; it updates everywhere in the game.

// ── World ────────────────────────────────────────────────────
export const WORLD_W       = 3200;
export const WORLD_H       = 600;

// ── Player ───────────────────────────────────────────────────
export const PLAYER_SPEED  = 220;   // horizontal run speed (px/s)
export const JUMP_FORCE    = -480;  // jump velocity  (negative = up)
export const EXTRA_GRAVITY = 600;   // added on top of world gravity
export const MAX_HEALTH    = 3;     // total hearts

// ── Enemy ────────────────────────────────────────────────────
export const ENEMY_SPEED   = 80;    // patrol speed

// ── Scoring ──────────────────────────────────────────────────
export const COIN_SCORE    = 10;
export const STOMP_SCORE   = 50;