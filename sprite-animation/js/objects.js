/*
 * Fausto Izquierdo
 * 2025-04-23
 */

import { animationDelay } from "./variables.js";

export const keyDirections = {
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export const playerMovement = {
  up: {
    axis: "y",
    direction: -1,
    frames: [60, 69],
    repeat: true,
    duration: animationDelay,
  },
  down: {
    axis: "y",
    direction: 1,
    frames: [40, 49],
    repeat: true,
    duration: animationDelay,
  },
  left: {
    axis: "x",
    direction: -1,
    frames: [50, 59],
    repeat: true,
    duration: animationDelay,
  },
  right: {
    axis: "x",
    direction: 1,
    frames: [70, 79],
    repeat: true,
    duration: animationDelay,
  },
  idle: {
    axis: "y",
    direction: 0,
    frames: [0, 2],
    repeat: true,
    duration: animationDelay,
  },
};
