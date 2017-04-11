
// Collidable Object class
class Collidable {
  constructor(type, x, y, height, width) {
    this.type = type;
    this.x = x; // x location of collidable in game space
    this.y = y; // y location of collidable in game space
    this.height = height; // height of object
    this.width = width; // width of object
  }
}

module.exports = Collidable;
