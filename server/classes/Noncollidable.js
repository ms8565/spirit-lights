

// Collidable Object class
class Noncollidable {
  constructor() {
    this.type = 'Default';
    this.x = 0; // x location of character on screen
    this.y = 0; // y location of character on screen
    this.height = 32; // height of character
    this.width = 32; // width of character
    this.action = 0; // action player is doing
    this.frame = 0; // frame in animation character is on
    this.frameCount = 0; // how many frames since last draw
  }
}

module.exports = Noncollidable;
