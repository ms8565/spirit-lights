
// Collidable Object class
const Collidable = require('./classes/Collidable.js');

const collidables = [];
const nonCollidables = [];
const waypoints = [];

const groundY = 410;

// Collidable(type, x, y, width, height)

const createShortBlock = (x) => {
  const blockWidth = 50;
  const blockHeight = 50;

  const block = new Collidable('blockS', x, groundY, blockWidth, blockHeight);
  collidables.push(block);
};

const createTallBlock = (x) => {
  const blockWidth = 50;
  const blockHeight = 100;

  const block = new Collidable('blockT', x, groundY - 50, blockWidth, blockHeight);
  collidables.push(block);
};

const createShortBush = (x) => {
  const bushWidth = 62;
  const bushHeight = 50;

  const bush = new Collidable('bushS', x, groundY - 10, bushWidth, bushHeight);
  collidables.push(bush);
};

const createTallBush = (x) => {
  const bushWidth = 120;
  const bushHeight = 100;

  const bush = new Collidable('bushT', x, groundY - 60, bushWidth, bushHeight);
  collidables.push(bush);
};

const createShortTree = (x) => {
  const branchWidth = 50;
  const branchHeight = 40;
  const treeHeight = 125;

  const tree = new Collidable('treeS', x, groundY - treeHeight / 2, branchWidth, branchHeight);
  collidables.push(tree);
};

const createTallTree = (x) => {
  const branchWidth = 50;
  const branchHeight = 40;
  // const treeHeight = 180;

  const tree = new Collidable('treeT', x, groundY - 120, branchWidth, branchHeight);
  collidables.push(tree);
};

const createShortTrunkedTree = (x) => {
    // Create Trunk
  const trunkWidth = 50;
  const trunkHeight = 80;
  const trunk = new Collidable('trunk1',
    x + 50,
    groundY - 26,
    trunkWidth,
    trunkHeight);

  // Create high, center branch
  const branch1Width = 135;
  const branch1Height = 80;
  const branch1 = new Collidable('branch1',
    x,
    groundY - trunkHeight - 60,
    branch1Width,
    branch1Height);


  collidables.push(trunk);
  collidables.push(branch1);
};

const createTallTrunkedTree = (x) => {
  // Create Trunk
  const trunkWidth = 50;
  const trunkHeight = 115;
  const trunk = new Collidable('trunk2', x + 40, groundY - 50, trunkWidth, trunkHeight);

  // Create higher, center branch
  const branch1Width = 135;
  const branch1Height = 80;
  const branch1 = new Collidable('branch1',
    x,
    groundY - trunkHeight - 50,
    branch1Width,
    branch1Height);

  // Create lower, right branch
  const branch2Width = 90;
  const branch2Height = 45;
  const branch2 = new Collidable('branch2',
    x + 90,
    groundY - trunkHeight + 30,
    branch2Width,
    branch2Height);

  collidables.push(trunk);
  collidables.push(branch1);
  collidables.push(branch2);
};

/* const createSmallPond = (x) => {
  const pondWidth = 500;
  const pondHeight = 100;

  const pond = new Collidable('pondS', x, groundY + 30, pondWidth, pondHeight);
  collidables.push(pond);
};
*/

const createLevel = () => {
  waypoints.push(160);

  // Level 1: Intro to blocks
  createShortBlock(400);
  createTallBlock(450);
  createShortBlock(500);

  waypoints.push(700);


  // Level 2: Intro to bushes
  createShortBlock(900);
  createTallBlock(950);
  createShortBush(1000);

  waypoints.push(1200);

  // Level 3: First puzzle
  createShortBush(1400);
  createTallBush(1460);
  createShortBush(1550);

  waypoints.push(1700);

  // Level 4: Intro to trees
  createShortBlock(1900);
  createShortTree(1950);

  createTallTree(2200);
  createTallTree(2260);

  createShortBlock(2400);
  createTallBlock(2450);
  createShortBlock(2475);

  createTallBlock(2650);
  createShortBlock(2700);

  createTallBlock(2850);
  createShortBlock(2900);

  createTallTree(2990);
  createShortTrunkedTree(3150);
  createTallBush(3300);

  waypoints.push(3500);

  // Level 5: More trees
  createShortBlock(3720);
  createShortTree(3620);
  createTallTree(3765);
  createTallTrunkedTree(3900);

  waypoints.push(4200);


  // Level 6: Intro to ponds

  // Level 7: Ponds puzzle
};

const getCollidables = () => collidables;

const getNonCollidables = () => nonCollidables;

const getWaypoints = () => waypoints;

module.exports.getCollidables = getCollidables;
module.exports.getNonCollidables = getNonCollidables;
module.exports.getWaypoints = getWaypoints;
module.exports.createLevel = createLevel;
