

// Player class
class Player {
  constructor(hash) {
    this.hash = hash; // character's unique id
    // last time this character was updated
    this.lastUpdate = new Date().getTime();
    this.x = 100; // x location of character on screen
    this.y = 450; // y location of character on screen
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
    this.lightUp = false;
    this.lightRadius = 100;
    this.minLight = 100;
    this.maxLight = 200;
    this.jumpHeight = -120;
    this.fallSpeed = 8;
    this.maxVelocityY = 16;
    this.velocityY = 0;
    this.velocityX = 0;
    this.dead = false;
    this.lastWaypoint = 0;
    this.jumping = false;
  }
}

module.exports = Player;
