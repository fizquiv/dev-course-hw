/*
 * Fausto Izquierdo
 * 2025-04-23
 */

import { variables } from "./variables.js";

export function getCtx() {
  return variables.ctx;
}

export function setCtx(value) {
  variables.ctx = value; // Modify the property of the object
}

export function getGame() {
  return variables.game;
}

export function setGame(value) {
  variables.game = value; // Modify the property of the object
}

export function getOldTime() {
  return variables.oldTime;
}

export function setOldTime(value) {
  variables.oldTime = value; // Modify the property of the object
}

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

  // Draw the background image
  ctx.drawImage(
    variables.backgroundImage,
    0,
    0,
    variables.canvasWidth,
    variables.canvasHeight
  );

  // Draw and update the game
  game.draw(ctx);
  game.update(deltaTime);

  // Update the old time
  setOldTime(newTime);

  // Request the next frame
  requestAnimationFrame(drawScene);
}
