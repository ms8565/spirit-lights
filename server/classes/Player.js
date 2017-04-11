

// Player class
class Player {
  constructor(hash) {
    this.hash = hash; // character's unique id
    // last time this character was updated
    this.lastUpdate = new Date().getTime();
    this.x = 0; // x location of character on screen
    this.y = 0; // y location of character on screen
    this.prevX = 0; // last known x location of character
    this.prevY = 0; // last known y location of character
    this.destX = 0; // destination x location of character
    this.destY = 0; // destination y location of character
    this.height = 32; // height of character
    this.width = 32; // width of character
    this.alpha = 0; // lerp amount (from prev to dest, 0 to 1)
    this.action = 0; // action player is doing
    this.frame = 0; // frame in animation character is on
    this.frameCount = 0; // how many frames since last draw
    this.moveLeft = false; // if character is moving left
    this.moveRight = false; // if character is moving right
    this.inAir = false;
    this.jumpHeight = -100;
    this.fallSpeed = 8;
    this.maxVelocityY = 12;
    this.velocityY = 0;
    this.velocityX = 0;
  }
  updateForces() {
    this.velocityY += this.fallSpeed;
    if (this.velocityY > this.maxVelocity) this.velocityY = this.maxVelocity;
  }
  jump() {
    this.velocityY += this.jumpHeight;
  }
}

module.exports = Player;
