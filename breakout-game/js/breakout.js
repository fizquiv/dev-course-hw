/*  Breakout – single-file version with power-ups (extra credit)  */

const canvasWidth = 800;
const canvasHeight = 600;

const paddleVelocity = 0.6; // px / ms
const ballVelocity = 0.35; // px / ms
const brickRows = 5;
const brickCols = 8;
const initialLives = 3;
const maxLives = 5;
const powerChance = 0.1; // 10 % drop chance
const powerSpeed = 0.15; // px / ms

let ctx,
  game,
  oldTime,
  gameStarted = false;

const backgroundImage = new Image();
backgroundImage.src = "../assets/background/background.jpg";

const heartImage = new Image();
heartImage.src = "../assets/sprites/heart.png";

const music = new Audio("../assets/sfx/music.mp3");
music.loop = true;
const gameOverSFX = new Audio("../assets/sfx/game-over.mp3");
const hitSFX = new Audio("../assets/sfx/ball-hit.wav");
const powerSFX = new Audio("../assets/sfx/ball-hit.wav"); // reuse hit sound

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(o) {
    return new Vec(this.x + o.x, this.y + o.y);
  }
  times(s) {
    return new Vec(this.x * s, this.y * s);
  }
}

function playSound(a) {
  a.currentTime = 0;
  a.play();
}

function boxOverlap(a, b) {
  return (
    a.position.x + a.width > b.position.x &&
    a.position.x < b.position.x + b.width &&
    a.position.y + a.height > b.position.y &&
    a.position.y < b.position.y + b.height
  );
}

class GameObject {
  constructor(position, width, height, color) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.color = color;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  update() {}
}

class Paddle extends GameObject {
  constructor() {
    super(new Vec(canvasWidth / 2 - 50, canvasHeight - 30), 100, 15, "#0077ff");
    this.velocity = new Vec(0, 0);
    this.keys = new Set();
  }
  update(deltaTime) {
    if (this.keys.has("left")) this.velocity.x = -paddleVelocity;
    else if (this.keys.has("right")) this.velocity.x = paddleVelocity;
    else this.velocity.x = 0;
    this.position = this.position.plus(this.velocity.times(deltaTime));
    if (this.position.x < 0) this.position.x = 0;
    if (this.position.x + this.width > canvasWidth)
      this.position.x = canvasWidth - this.width;
  }
}

class Ball extends GameObject {
  constructor() {
    super(new Vec(canvasWidth / 2, canvasHeight / 2), 12, 12, "#ffffff");
    this.reset();
  }
  reset() {
    this.position = new Vec(canvasWidth / 2, canvasHeight / 2);
    this.velocity = new Vec(
      (Math.random() > 0.5 ? 1 : -1) * ballVelocity,
      -ballVelocity
    );
  }
  update(deltaTime) {
    this.position = this.position.plus(this.velocity.times(deltaTime));
    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = Math.abs(this.velocity.x);
      playSound(hitSFX);
    }
    if (this.position.x + this.width > canvasWidth) {
      this.position.x = canvasWidth - this.width;
      this.velocity.x = -Math.abs(this.velocity.x);
      playSound(hitSFX);
    }
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = Math.abs(this.velocity.y);
      playSound(hitSFX);
    }
  }
}

class Brick extends GameObject {
  constructor(x, y, w, h, color) {
    super(new Vec(x, y), w, h, color);
    this.destroyed = false;
  }
}

class PowerUp extends GameObject {
  constructor(position) {
    super(position, 16, 16, "#ffcc00");
  }
  update(deltaTime) {
    this.position.y += powerSpeed * deltaTime;
  }
}

class Game {
  constructor(colors) {
    this.paddle = new Paddle();
    this.ball = new Ball();
    this.bricks = [];
    this.powerUps = [];
    this.score = 0;
    this.lives = initialLives;
    this.over = false;
    this.win = false;
    this.addBricks(colors);
    this.addListeners();
    music.currentTime = 0;
    music.play();
  }
  addBricks(colors) {
    const m = 5;
    const bw = (canvasWidth - m * (brickCols + 1)) / brickCols;
    const bh = 20;
    let i = 0;
    for (let r = 0; r < brickRows; r++)
      for (let c = 0; c < brickCols; c++) {
        const x = m + c * (bw + m);
        const y = 50 + r * (bh + m);
        this.bricks.push(new Brick(x, y, bw, bh, colors[i++]));
      }
  }
  addListeners() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") this.paddle.keys.add("left");
      if (e.key === "ArrowRight") this.paddle.keys.add("right");
    });
    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft") this.paddle.keys.delete("left");
      if (e.key === "ArrowRight") this.paddle.keys.delete("right");
    });
  }
  maybeDropPowerUp(brick) {
    if (Math.random() < powerChance) {
      const pos = new Vec(
        brick.position.x + brick.width / 2 - 8,
        brick.position.y
      );
      this.powerUps.push(new PowerUp(pos));
    }
  }
  update(deltaTime) {
    if (this.over) return;
    this.paddle.update(deltaTime);
    this.ball.update(deltaTime);

    if (boxOverlap(this.ball, this.paddle)) {
      this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
      this.ball.position.y = this.paddle.position.y - this.ball.height - 1;
      playSound(hitSFX);
    }

    for (const brick of this.bricks) {
      if (!brick.destroyed && boxOverlap(this.ball, brick)) {
        brick.destroyed = true;
        this.ball.velocity.y *= -1;
        this.score++;
        playSound(hitSFX);
        this.maybeDropPowerUp(brick);
        if (this.score === brickRows * brickCols) this.winGame();
      }
    }

    for (const p of this.powerUps) {
      p.update(deltaTime);
      if (boxOverlap(p, this.paddle)) {
        if (this.lives < maxLives) this.lives++;
        p.collected = true;
        playSound(powerSFX);
      }
      if (p.position.y > canvasHeight) p.collected = true;
    }
    this.powerUps = this.powerUps.filter((p) => !p.collected);

    if (this.ball.position.y > canvasHeight) {
      this.lives--;
      if (this.lives > 0) this.ball.reset();
      else this.endGame();
    }
  }
  draw(ctx) {
    if (backgroundImage.complete)
      ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
    this.bricks.forEach((b) => !b.destroyed && b.draw(ctx));
    this.powerUps.forEach((p) => p.draw(ctx));
    this.paddle.draw(ctx);
    this.ball.draw(ctx);

    ctx.fillStyle = "#ffffff";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${this.score}`, 20, 25);

    for (let i = 0; i < this.lives; i++)
      ctx.drawImage(
        heartImage,
        canvasWidth - 30 * (i + 1),
        canvasHeight - 30,
        25,
        25
      );

    if (this.over) {
      ctx.font = "40px Arial";
      ctx.fillText(
        this.win ? "YOU WIN!" : "GAME OVER",
        canvasWidth / 2 - (this.win ? 100 : 120),
        canvasHeight / 2
      );
    }
  }
  endGame() {
    this.over = true;
    this.win = false;
    music.pause();
    gameOverSFX.play();
    document.getElementById("restart-button").style.display = "block";
  }
  winGame() {
    this.over = true;
    this.win = true;
    music.pause();
    document.getElementById("restart-button").style.display = "block";
  }
}

let initialBrickColors = [];

function drawInitialScene() {
  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
  const m = 5;
  const bw = (canvasWidth - m * (brickCols + 1)) / brickCols;
  const bh = 20;
  initialBrickColors = [];
  for (let r = 0; r < brickRows; r++)
    for (let c = 0; c < brickCols; c++) {
      const x = m + c * (bw + m);
      const y = 50 + r * (bh + m);
      const color = `hsl(${Math.random() * 360},70%,60%)`;
      initialBrickColors.push(color);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, bw, bh);
    }
}

function drawScene(time) {
  if (!gameStarted) return;
  if (oldTime === undefined) oldTime = time;
  const deltaTime = time - oldTime;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  game.update(deltaTime);
  game.draw(ctx);
  oldTime = time;
  requestAnimationFrame(drawScene);
}

function startGame() {
  gameStarted = true;
  document.getElementById("start-button").style.display = "none";
  document.getElementById("restart-button").style.display = "none";
  oldTime = undefined;
  game = new Game(initialBrickColors);
  requestAnimationFrame(drawScene);
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext("2d");

  backgroundImage.onload = drawInitialScene;
  if (backgroundImage.complete) drawInitialScene();

  document.getElementById("start-button").addEventListener("click", startGame);
  document
    .getElementById("restart-button")
    .addEventListener("click", startGame);
});
