'use strict';
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

const createSmallPond = (x) => {
  const pondWidth = 500;
  const pondHeight = 100;

  const pond = new Collidable('pondS', x, groundY + 30, pondWidth, pondHeight);
  collidables.push(pond);
};




const createLevel = () => {
  // Level 1: Intro to blocks
  createShortBlock(200);
  createTallBlock(250);
  createShortBlock(300);
  
  waypoints.push(500);
  

  // Level 2: Intro to bushes
  createShortBush(700);
  createTallBush(570);
  createShortBush(660);

  // Level 3: First puzzle

  // Level 4: Intro to trees
  createShortBlock(850);
  createShortTree(900);

  createTallTree(1000);
  
  createShortBush(250);
  createTallBush(300);
  createTallTree(400);
  
  createTallTree(600);
  
  createTallTree(800);
  
  createSmallPond(400)
  
  waypoints.push(100);
  waypoints.push(200);
  waypoints.push(600);
  waypoints.push(800);

  // Level 4.5: Trees Puzzle

  // Level 6: Intro to ponds

  // Level 7: Ponds puzzle
};

const getCollidables = () => {
  return collidables;
}

const getNonCollidables = () => {
  return nonCollidables;
}

const getWaypoints = () => {
  return waypoints;
}

module.exports.getCollidables = getCollidables;
module.exports.getNonCollidables = getNonCollidables;
module.exports.getWaypoints = getWaypoints;
module.exports.createLevel = createLevel;
