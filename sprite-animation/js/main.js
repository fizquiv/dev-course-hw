/*
 * Fausto Izquierdo
 * 2025-04-23
 */

import { canvasWidth, canvasHeight, setCtx, setGame } from "./variables.js";
import { Game } from "./classes.js";
import { drawScene } from "./functions.js";

function main() {
  const canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set the canvas context
  setCtx(canvas.getContext("2d"));

  // Create and set the game object
  const game = new Game();
  setGame(game);

  // Start the game loop
  drawScene(0);
}

main();
