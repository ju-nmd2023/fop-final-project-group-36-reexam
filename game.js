// Constants
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 600;
const SPACESHIP_SPEED_INCREMENT = 10;
const LASER_SIZE = 20;
const MOTHERSHIP_WIDTH = 200;
const MOTHERSHIP_HEIGHT = 100;
const UFO_SPAWN_INTERVAL = 3000;
const UFO_SPAWN_X = 1200;
const UFO_SPAWN_Y_MIN = 0;
const UFO_SPAWN_Y_MAX = GAME_HEIGHT;
const LIGHT_SHOT_SPEED = 10;
const LASER_SPEED = -20;
const MOTHERSHIP_FIRE_RATE = 60;
const MOTHERSHIP_VERTICAL_SPEED = 6;
const SPACESHIP_Y_MIN = 75;
const SPACESHIP_Y_MAX = GAME_HEIGHT - 75;
const GAME_OVER_TEXT = "Game Over";
const START_SCREEN_TEXT = "Space Shooter";
const START_BUTTON_TEXT = "Start";
const START_OVER_BUTTON_TEXT = "Start Over";
const STAT_SCREEN_TEXT = "Score: ";
const STAT_SCREEN_LIVES_TEXT = "Lives: ";
const STAT_SCREEN_LEVEL_TEXT = "Level: ";

// Game state
let gameStarted = false;
let gameOverFlag = false;
let score = 0;
let lives = 2;
let level = 1;
let spaceshipYSpeed = 0;
let lightShots = [];
let lasers = [];
let mothership;
let gameObjects = [];
let stars = [];
let startButton;
let startOverButton;
let statDiv;

// Setup
function setup() {
  createCanvas(GAME_WIDTH, GAME_HEIGHT);
  setInterval(spawnUfo, UFO_SPAWN_INTERVAL);
  createStatScreen();
  createStartScreen();
  generateStars();
  noStroke();
  mothership = null;
}

// Game logic
function draw() {
  if (!gameStarted) {
    drawStartScreen();
  } else {
    background(0, 10, 30);
    drawStars();
    spaceship();
    jets();
    moveLightShots();
    displayLightShots();

    if (!gameOverFlag) {
      if (score < 150) {
        for (let i = gameObjects.length - 1; i >= 0; i--) {
          gameObjects[i].display();
          gameObjects[i].move();

          // Collision Spaceship/UFO
          if (dist(gameObjects[i].x, gameObjects[i].y, width / 2, height / 2) < 200) {
            gameOver();
          }

          // Contact Light shot/UFO
          for (let j = lightShots.length - 1; j >= 0; j--) {
            if (dist(gameObjects[i].x, gameObjects[i].y, lightShots[j].x, lightShots[j].y) < 50) {
              gameObjects.splice(i, 1);
              score += 10;
              break;
            }
          }
        }
      } else {
        if (!mothership) {
          mothership = new Mothership(900, 300);
        }

        mothership.display();
        mothership.move();

        // Collision Spaceship/Mothership
        if (dist(mothership.x, mothership.y, width / 2, height / 2) < 200) {
          gameOver();
        }

        // Contact Light shot/Mothership
        for (let j = lightShots.length - 1; j >= 0; j--) {
          if (dist(mothership.x, mothership.y, lightShots[j].x, lightShots[j].y) < 50) {
            score += 50;
            mothership = null;
            break;
          }
        }

        // Lasers shot from Mothership
        for (let k = lasers.length - 1; k >= 0; k--) {
          lasers[k].display();
          lasers[k].move();

          // Contact Laser/Spaceship
          if (dist(lasers[k].x, lasers[k].y, width / 2, height / 2) < 50) {
            gameOver();
          }
        }
      }

      height / 2 += spaceshipYSpeed;
      height / 2 = constrain(height / 2, SPACESHIP_Y_MIN, SPACESHIP_Y_MAX);

      updateStatScreen();
    }
  }
}

// Classes
class Laser {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = LASER_SIZE;
    this.speed = LASER_SPEED;
  }

  display() {
    fill(230, 10, 0);
    rect(this.x, this.y, this.size, this.size);
  }

  move() {
    this.x += this.speed;
  }
}

class Mothership {
  constructor(x, y) {
    this