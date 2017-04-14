// Collidable Object class
const Collidable = require('./classes/Collidable.js');

const collidables = [];

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
  const branch1Width = 145;
  const branch1Height = 100;
  const branch1 = new Collidable('branch1',
    x,
    groundY - trunkHeight - 90,
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
  const branch1Width = 145;
  const branch1Height = 100;
  const branch1 = new Collidable('branch1',
    x,
    groundY - trunkHeight - 80,
    branch1Width,
    branch1Height);

  // Create lower, right branch
  const branch2Width = 90;
  const branch2Height = 45;
  const branch2 = new Collidable('branch2',
    x + 90, 
    groundY - trunkHeight + 10,
    branch2Width,
    branch2Height);

  collidables.push(trunk);
  collidables.push(branch1);
  collidables.push(branch2);
};



const createLevel = () => {
  /*// Level 1: Intro to blocks
  createShortBlock(200);
  createTallBlock(250);
  createShortBlock(300);

  // Level 2: Intro to bushes
  createShortBush(500);
  createTallBush(570);
  createShortBush(660);

  // Level 3: First puzzle

  // Level 4: Intro to trees
  createShortBlock(850);
  createShortTree(900);

  createTallTree(1000);*/
  
  createShortTree(200);
  createTallTree(300);
  
  createShortTrunkedTree(700);
  createTallTrunkedTree(400);

  // Level 4.5: Trees Puzzle

  // Level 6: Intro to ponds

  // Level 7: Ponds puzzle

  return collidables;
};

module.exports.createLevel = createLevel;
