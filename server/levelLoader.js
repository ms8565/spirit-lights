// Collidable Object class
const Collidable = require('./classes/Collidable.js');

const collidables = [];

const groundY = 400;

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

/* const createSmallTree = (x) => {
  const branchWidth = 80;
  const branchHeight = 60;
  const treeHeight = 120;

  const tree = new Collidable('treeS', x, groundY + treeHeight, branchWidth, branchHeight);
  collidables.push(tree);
};

const createTallTree = (x) => {
  const branchWidth = 80;
  const branchHeight = 60;
  const treeHeight = 200;

  const tree = new Collidable('treeT', x, groundY + treeHeight, branchWidth, branchHeight);
  collidables.push(tree);
};

const createSmallTrunkedTree = (x) => {
  // Create Trunk
  const trunkWidth = 40;
  const trunkHeight = 100;
  const trunk = new Collidable('trunk', x, groundY, trunkWidth, trunkHeight);

  // Create higher, center branch
  const branch1Width = 75;
  const branch1Height = 25;
  const branch1 = new Collidable('branch1',
    x, groundY + trunkHeight - 20,
    branch1Width,
    branch1Height);

  // Create lower, right branch
  const branch2Width = 50;
  const branch2Height = 25;
  const branch2 = new Collidable('branch2',
    x, groundY + trunkHeight - 50,
    branch2Width,
    branch2Height);

  collidables.push(trunk);
  collidables.push(branch1);
  collidables.push(branch2);
};

const createLargeTrunkedTree = (x) => {
    // Create Trunk
  const trunkWidth = 50;
  const trunkHeight = 150;
  const trunk = new Collidable('trunk',
    x,
    groundY,
    trunkWidth,
    trunkHeight);

  // Create high, center branch
  const branch1Width = 80;
  const branch1Height = 40;
  const branch1 = new Collidable('branch1',
    x, groundY + trunkHeight - 20,
    branch1Width,
    branch1Height);


  collidables.push(trunk);
  collidables.push(branch1);
};*/

const createLevel = () => {
  createShortBlock(200);
  createTallBlock(250);
  createShortBlock(300);

  return collidables;
};

module.exports.createLevel = createLevel;
