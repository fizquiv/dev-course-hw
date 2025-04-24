/*
 * Fausto Izquierdo
 * 2025-04-23
 */

import {
  getCtx,
  getGame,
  getOldTime,
  setOldTime,
  canvasWidth,
  canvasHeight,
} from "./variables.js";

export function boxOverlap(obj1, obj2) {
  return (
    obj1.position.x + obj1.width > obj2.position.x &&
    obj1.position.x < obj2.position.x + obj2.width &&
    obj1.position.y + obj1.height > obj2.position.y &&
    obj1.position.y < obj2.position.y + obj2.height
  );
}

export function drawScene(newTime) {
  const ctx = getCtx();
  const game = getGame();
  let oldTime = getOldTime();

  if (oldTime == undefined) {
    oldTime = newTime;
  }
  const deltaTime = newTime - oldTime;

  // Clear the canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw and update the game
  game.draw(ctx);
  game.update(deltaTime);

  // Update the old time
  setOldTime(newTime);

  // Request the next frame
  requestAnimationFrame(drawScene);
}
