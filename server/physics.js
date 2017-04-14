

// our socket code for physics to send updates back
const sockets = require('./sockets.js');

let rooms = {};
// let playerList = {}; // list of Players

let collidables = [];

const groundY = 430;

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
const checkPlayerCollisions = (player1Rect, hash, roomName) => {
  const players = rooms[roomName].players;
  const keys = Object.keys(players);

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
const checkObjectCollisions = (playerRect, hash, roomName) => {
  const players = rooms[roomName].players;

  for (let i = 0; i < collidables.length; i++) {
    const collidableRect = { x: collidables[i].x,
      y: collidables[i].y,
      width: collidables[i].width,
      height: collidables[i].height };

    if (isColliding(playerRect, collidableRect)) {
      if (collidables[i].type === 'pondS' || collidables[i].type === 'pondL') {
        players[hash].dead = true;
      }
      return true;
    }
  }
  return false;
};

// Check if new X update would cause the player to collide
const checkMoveX = (player, roomName) => {
  const newX = player.prevX + player.velocityX;

  const player1 = { x: newX,
    y: player.y,
    width: player.width,
    height: player.height };

  if (checkPlayerCollisions(player1, player.hash, roomName)) return true;

  if (checkObjectCollisions(player1, player.hash, roomName)) return true;

  return false;
};


// Check if new Y update would cause the player to collide
const checkMoveY = (player, roomName) => {
  const newY = player.prevY + player.velocityY + 5;

  // If the player is below the ground
  if (newY > groundY) {
    return true;
  }

  const player1 = { x: player.x,
    y: newY,
    width: player.width,
    height: player.height };

  if (checkPlayerCollisions(player1, player.hash, roomName)) return true;

  if (checkObjectCollisions(player1, player.hash, roomName)) return true;

  return false;
};


// update rooms list
const setRoomList = (newRoomList) => {
  rooms = newRoomList;
};

// update player list
const setPlayerList = (newPlayerList, roomName) => {
  rooms[roomName].players = newPlayerList;
};

const setCollidablesList = (newCollidables) => {
  collidables = newCollidables;
};

// update a player
const setPlayer = (player, roomName) => {
  rooms[roomName].players[player.hash] = player;
};

const updatePhysics = (roomName) => {
  const players = rooms[roomName].players;

  // gravity update physics
  const keys = Object.keys(players);
  for (let i = 0; i < keys.length; i++) {
    // Check if next update of gravity will make the player collide
    if (checkMoveY(players[keys[i]], roomName)) {
        // Player will collide on y axis
      players[keys[i]].velocityY = 0;
      players[keys[i]].destY = players[keys[i]].prevY;
    } else {
      // Otherwise update position with gravity
      players[keys[i]].velocityY += players[keys[i]].fallSpeed;

      if (players[keys[i]].velocityY > players[keys[i]].maxVelocityY) {
        players[keys[i]].velocityY = players[keys[i]].maxVelocityY;
      }

      players[keys[i]].destY = players[keys[i]].prevY + players[keys[i]].velocityY;
    }

    // Update light radius
    if (players[keys[i]].lightUp) {
      // If the player is lighting up, increase light to max radius
      if (players[keys[i]].lightRadius <= players[keys[i]].maxLight) {
        players[keys[i]].lightRadius += 5;
      }
    } else {
      // If the player isn't lighting up, decrease light to min radius
      if (players[keys[i]].lightRadius >= players[keys[i]].minLight) {
        players[keys[i]].lightRadius -= 5;
      }
    }

    // Update the last waypoint the player has passed


    players[keys[i]].lastUpdate = new Date().getTime();
  }
  sockets.updatePhysics(players, roomName);
};

// Update players every 20ms
setInterval(() => {
  // Update physics for every room
  const keys = Object.keys(rooms);
  for (let i = 0; i < keys.length; i++) {
    updatePhysics(keys[i]);
  }
}, 20);

const playerJump = (player, roomName) => {
  const players = rooms[roomName].players;

  // If the player isn't in the air
  if (players[player.hash].velocityY === 0) {
    players[player.hash].velocityY += players[player.hash].jumpHeight;
    players[player.hash].inAir = true;
    updatePhysics(roomName);
  }
};

module.exports.setPlayerList = setPlayerList;
module.exports.setCollidablesList = setCollidablesList;
module.exports.setPlayer = setPlayer;
module.exports.playerJump = playerJump;
module.exports.checkMoveX = checkMoveX;
module.exports.setRoomList = setRoomList;
