/*
 * Fausto Izquierdo
 * 2025-04-23
 */

// Global variables
export const canvasWidth = 800;
export const canvasHeight = 600;
export const animationDelay = 100;

let ctx;
let game;
let oldTime;

// Speed
export const playerSpeed = 0.3;

// Getter and setter functions
export function getCtx() {
  return ctx;
}

export function setCtx(value) {
  ctx = value;
}

export function getGame() {
  return game;
}

export function setGame(value) {
  game = value;
}

export function getOldTime() {
  return oldTime;
}

export function setOldTime(value) {
  oldTime = value;
}
