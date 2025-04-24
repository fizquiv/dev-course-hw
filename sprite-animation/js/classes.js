/*
 * Fausto Izquierdo
 * 2025-04-23
 */

import {
  canvasWidth,
  canvasHeight,
  playerSpeed,
  animationDelay,
} from "./variables.js";
import { keyDirections, playerMovement } from "./objects.js";
import { boxOverlap } from "./functions.js";

export class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }

  minus(other) {
    return new Vec(this.x - other.x, this.y - other.y);
  }

  times(scalar) {
    return new Vec(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    if (mag == 0) {
      return new Vec(0, 0);
    }
    return new Vec(this.x / mag, this.y / mag);
  }
}

export class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export class GameObject {
  constructor(position, width, height, color, type) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.color = color;
    this.type = type;
  }

  setSprite(imagePath, rect) {
    this.spriteImage = new Image();
    this.spriteImage.src = imagePath;
    if (rect) {
      this.spriteRect = rect;
    }
  }

  draw(ctx) {
    if (this.spriteImage) {
      if (this.spriteRect) {
        ctx.drawImage(
          this.spriteImage,
          this.spriteRect.x * this.spriteRect.width,
          this.spriteRect.y * this.spriteRect.height,
          this.spriteRect.width,
          this.spriteRect.height,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      } else {
        ctx.drawImage(
          this.spriteImage,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
        //this.position.x * scale, this.position.y * scale,
        //this.width * scale, this.height * scale);
      }
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }

    this.drawBoundingBox(ctx);
  }

  drawBoundingBox(ctx) {
    // Draw the bounding box of the sprite
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.rect(this.position.x, this.position.y, this.width, this.height);
    ctx.stroke();
  }

  // Empty template for all GameObjects to be able to update
  update() {}
}

export class AnimatedObject extends GameObject {
  constructor(position, width, height, color, type, sheetCols) {
    super(position, width, height, color, type);
    // Animation properties
    this.frame = 0;
    this.minFrame = 0;
    this.maxFrame = 0;
    this.sheetCols = sheetCols;

    this.repeat = true;

    // Delay between frames (in milliseconds)
    this.frameDuration = 100;
    this.totalTime = 0;
  }

  setAnimation(minFrame, maxFrame, repeat, duration) {
    this.minFrame = minFrame;
    this.maxFrame = maxFrame;
    this.frame = minFrame; // Start from the first frame of the new animation
    this.repeat = repeat;
    this.totalTime = 0; // Reset the time to start the animation immediately
    this.frameDuration = duration;
  }

  updateFrame(deltaTime) {
    this.totalTime += deltaTime;
    if (this.totalTime > this.frameDuration) {
      // Loop around the animation frames if the animation is set to repeat
      // Otherwise stay on the last frame
      let restartFrame = this.repeat ? this.minFrame : this.frame;
      this.frame = this.frame < this.maxFrame ? this.frame + 1 : restartFrame;
      this.spriteRect.x = this.frame % this.sheetCols;
      this.spriteRect.y = Math.floor(this.frame / this.sheetCols);
      this.totalTime = 0;
    }
  }
}

export class Coin extends AnimatedObject {
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "coin", sheetCols);
    this.keys = [];
  }

  update(deltaTime) {
    this.updateFrame(deltaTime);
  }
}

export class Player extends AnimatedObject {
  constructor(position, width, height, color, sheetCols) {
    super(position, width, height, color, "player", sheetCols);
    this.velocity = new Vec(0, 0);
    this.keys = [];
    this.previousDirection = "down";
    this.currentDirection = "down";
  }

  update(deltaTime) {
    this.setVelocity();
    this.setMovementAnimation();

    this.position = this.position.plus(this.velocity.times(deltaTime));

    this.constrainToCanvas();

    this.updateFrame(deltaTime);
  }

  constrainToCanvas() {
    if (this.position.y < 0) {
      this.position.y = 0;
    } else if (this.position.y + this.height > canvasHeight) {
      this.position.y = canvasHeight - this.height;
    } else if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width > canvasWidth) {
      this.position.x = canvasWidth - this.width;
    }
  }

  setVelocity() {
    this.velocity = new Vec(0, 0);
    for (const key of this.keys) {
      const move = playerMovement[key];
      this.velocity[move.axis] += move.direction;
    }
    this.velocity = this.velocity.normalize().times(playerSpeed);
  }

  setMovementAnimation() {
    // Identify the current movement direction
    if (Math.abs(this.velocity.y) > Math.abs(this.velocity.x)) {
      if (this.velocity.y > 0) {
        this.currentDirection = "down";
      } else if (this.velocity.y < 0) {
        this.currentDirection = "up";
      } else {
        this.currentDirection = "idle";
      }
    } else {
      if (this.velocity.x > 0) {
        this.currentDirection = "right";
      } else if (this.velocity.x < 0) {
        this.currentDirection = "left";
      } else {
        this.currentDirection = "idle";
      }
    }

    // Select the correct animation and reset it immediately
    if (this.currentDirection !== this.previousDirection) {
      const anim = playerMovement[this.currentDirection];
      this.setAnimation(...anim.frames, anim.repeat, anim.duration);
      this.frame = this.minFrame; // Reset to the first frame of the new animation
    }

    // Update direction
    this.previousDirection = this.currentDirection;
  }
}

export class TextLabel {
  constructor(x, y, font, color) {
    this.x = x;
    this.y = y;
    this.font = font;
    this.color = color;
  }

  draw(ctx, text) {
    ctx.font = this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(text, this.x, this.y);
  }
}

export class Game {
  constructor() {
    this.createEventListeners();
    this.initObjects();
  }

  initObjects() {
    this.player = new Player(
      new Vec(canvasWidth / 2, canvasHeight / 2),
      32,
      32,
      "red",
      10
    );
    this.player.setSprite(
      "../assets/sprites/link_sprite_sheet.png",
      new Rect(0, 0, 120, 130)
    );
    this.player.setAnimation(7, 7, false, animationDelay);

    this.actors = [];
    this.coins = this.generateCoins(10); // Generate 10 random coins
  }

  generateCoins(count) {
    const coins = [];
    for (let i = 0; i < count; i++) {
      const randomX = Math.random() * (canvasWidth - 32); // Ensure coin fits within canvas
      const randomY = Math.random() * (canvasHeight - 32);
      const coin = new Coin(new Vec(randomX, randomY), 32, 32, "yellow", 8);
      coin.setSprite("../assets/sprites/coin_gold.png", new Rect(0, 0, 32, 32));
      coin.setAnimation(0, 7, true, animationDelay);
      coins.push(coin);
    }
    return coins;
  }

  draw(ctx) {
    for (let actor of this.actors) {
      actor.draw(ctx);
    }
    for (let coin of this.coins) {
      coin.draw(ctx);
    }
    this.player.draw(ctx);
  }

  update(deltaTime) {
    for (let actor of this.actors) {
      actor.update(deltaTime);
    }

    // Check for collisions between the player and coins
    this.coins = this.coins.filter((coin) => {
      if (boxOverlap(this.player, coin)) {
        // Coin is collected, remove it
        return false;
      }
      return true;
    });

    for (let coin of this.coins) {
      coin.update(deltaTime);
    }

    this.player.update(deltaTime);
  }

  createEventListeners() {
    window.addEventListener("keydown", (event) => {
      if (Object.keys(keyDirections).includes(event.key)) {
        this.add_key(keyDirections[event.key]);
      }
    });

    window.addEventListener("keyup", (event) => {
      if (Object.keys(keyDirections).includes(event.key)) {
        this.del_key(keyDirections[event.key]);
      }
    });
  }

  add_key(direction) {
    if (!this.player.keys.includes(direction)) {
      this.player.keys.push(direction);
    }
  }

  del_key(direction) {
    let index = this.player.keys.indexOf(direction);
    if (index != -1) {
      this.player.keys.splice(index, 1);
    }
  }
}
