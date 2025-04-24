/*
 * Fausto Izquierdo
 * 2025-04-23
 */
import { variables } from "./variables.js";
import { drawScene, setCtx, setGame } from "./functions.js";
import { Game } from "./classes.js";

function main() {
  const canvas = document.getElementById("canvas");
  canvas.width = variables.canvasWidth;
  canvas.height = variables.canvasHeight;

  // Set the canvas context
  setCtx(canvas.getContext("2d"));

  // Create and set the game object
  const game = new Game();
  setGame(game);

  // Start the game loop
  drawScene(0);
}

main();
