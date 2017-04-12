

// our socket code for physics to send updates back
const sockets = require('./sockets.js');

let playerList = {}; // list of Players

let collidables = [];

// box collision check between two rectangles
// of a set width/height
const isColliding = (rect1, rect2) => {
  if (rect1.x < rect2.x + rect2.width &&
     rect1.x + rect1.width > rect2.x &&
     rect1.y < rect2.y + rect2.height &&
     rect1.height + rect1.y > rect2.y) {
    return true;
  }
  return false;
};

// check if player is colliding with other players
const checkPlayerCollisions = (player1Rect, hash) => {
  const keys = Object.keys(playerList);
  const players = playerList;

  for (let i = 0; i < keys.length; i++) {
    const player2Rect = { x: players[keys[i]].x,
      y: players[keys[i]].y,
      width: players[keys[i]].width,
      height: players[keys[i]].height };

    if (hash !== players[keys[i]].hash) {
      if (isColliding(player1Rect, player2Rect)) {
        return true;
      }
    }
  }
  return false;
};

// check if player is colliding with objects
const checkObjectCollisions = (playerRect) => {
  for (let i = 0; i < collidables.length; i++) {
    const collidableRect = { x: collidables[i].x,
      y: collidables[i].y,
      width: collidables[i].width,
      height: collidables[i].height };

    if (isColliding(playerRect, collidableRect)) {
      return true;
    }
  }
  return false;
};

// Check if new X update would cause the player to collide
const checkMoveX = (player) => {
  const newX = player.prevX + player.velocityX;

  const player1 = { x: newX,
    y: player.y,
    width: player.width,
    height: player.height };

  if (checkPlayerCollisions(player1, player.hash)) return true;

  if (checkObjectCollisions(player1)) return true;

  return false;
};


// Check if new Y update would cause the player to collide
const checkMoveY = (player) => {
  const newY = player.prevY + player.velocityY + 5;

  // If the player is below the ground
  if (newY > 400) {
    return true;
  }

  const player1 = { x: player.x,
    y: newY,
    width: player.width,
    height: player.height };

  if (checkPlayerCollisions(player1, player.hash)) return true;

  if (checkObjectCollisions(player1)) return true;

  return false;
};


// update player list
const setPlayerList = (newPlayerList) => {
  playerList = newPlayerList;
};

const setCollidablesList = (newCollidables) => {
  collidables = newCollidables;
};

// update a player
const setPlayer = (player) => {
  playerList[player.hash] = player;
};

const updatePhysics = () => {
  // gravity update physics
  const keys = Object.keys(playerList);
  for (let i = 0; i < keys.length; i++) {
    // Check if next update of gravity will make the player collide
    if (checkMoveY(playerList[keys[i]])) {
        // Player will collide on y axis
      playerList[keys[i]].velocityY = 0;
      playerList[keys[i]].destY = playerList[keys[i]].prevY;
    } else {
      // Otherwise update position with gravity
      playerList[keys[i]].velocityY += playerList[keys[i]].fallSpeed;

      if (playerList[keys[i]].velocityY > playerList[keys[i]].maxVelocityY) {
        playerList[keys[i]].velocityY = playerList[keys[i]].maxVelocityY;
      }

      playerList[keys[i]].destY = playerList[keys[i]].prevY + playerList[keys[i]].velocityY;
    }

    // Update light radius
    if (playerList[keys[i]].lightUp) {
      // If the player is lighting up, increase light to max radius
      if (playerList[keys[i]].lightRadius <= playerList[keys[i]].maxLight) {
        playerList[keys[i]].lightRadius += 5;
      }
    } else {
      // If the player isn't lighting up, decrease light to min radius
      if (playerList[keys[i]].lightRadius >= playerList[keys[i]].minLight) {
        playerList[keys[i]].lightRadius -= 5;
      }
    }

    playerList[keys[i]].lastUpdate = new Date().getTime();
  }
  sockets.updatePhysics(playerList);
};

// Update players every 20ms
setInterval(() => {
  updatePhysics();
}, 20);

const playerJump = (player) => {
  // If the player isn't in the air
  if (playerList[player.hash].velocityY === 0) {
    playerList[player.hash].velocityY += playerList[player.hash].jumpHeight;
    playerList[player.hash].inAir = true;
    updatePhysics();
  }
};

module.exports.setPlayerList = setPlayerList;
module.exports.setCollidablesList = setCollidablesList;
module.exports.setPlayer = setPlayer;
module.exports.playerJump = playerJump;
module.exports.checkMoveX = checkMoveX;
