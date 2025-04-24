/*
 * Fausto Izquierdo
 * 2025-04-23
 */

// Global variables
export const variables = {
  canvasWidth: 800,
  canvasHeight: 600,
  animationDelay: 100,
  playerSpeed: 0.3,
  ctx: null,
  game: null,
  oldTime: null,
  backgroundImage: new Image(),
};

// Set the background image source
variables.backgroundImage.src = "../assets/background/background.jpg";
