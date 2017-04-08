

// our socket code for physics to send updates back
const sockets = require('./sockets.js');

let playerList = {}; // list of Players

// box collision check between two rectangles
// of a set width/height
const isColliding = (player1, player2) => {
  const width = 30;
  const height = 50;
  if (player1.x < player2.x + width &&
     player1.x + width > player2.x &&
     player1.y < player2.y + height &&
     height + player1.y > player2.y) {
    return true;
  }
  return false;
};

const checkPlayerCollisions = () => {
    // get all characters
  const keys = Object.keys(playerList);
  const players = playerList;

  for (let i = 0; i < keys.length; i++) {
    for (let k = 0; k < keys.length; k++) {
      const player1 = players[keys[i]];
      const player2 = players[keys[k]];

      if (player1.hash !== player2.hash) {
        const collision = isColliding(player1, player2);

        if (collision) {
                // console.log("players are colliding");
        }
      }
    }
  }
};

// update player list
const setPlayerList = (newPlayerList) => {
  playerList = newPlayerList;
};

// update a player
const setPlayer = (player) => {
  playerList[player.hash] = player;
};

const updatePhysics = () => {
  checkPlayerCollisions();

  // gravity update physics
  const keys = Object.keys(playerList);
  for (let i = 0; i < keys.length; i++) {
    if (playerList[keys[i]].destY < 390) {
      playerList[keys[i]].velocityY += playerList[keys[i]].fallSpeed;
    }
    if (playerList[keys[i]].velocityY > playerList[keys[i]].maxVelocity) {
      playerList[keys[i]].velocityY = playerList[keys[i]].maxVelocity;
    }

    playerList[keys[i]].destY += playerList[keys[i]].velocityY;

    if (playerList[keys[i]].destY <= 0) playerList[keys[i]].destY = 1;
    if (playerList[keys[i]].destY >= 400) playerList[keys[i]].destY = 399;

    playerList[keys[i]].lastUpdate = new Date().getTime();
  }
  sockets.updatePhysics(playerList);
};

// Update players every 20ms
setInterval(() => {
  updatePhysics();
}, 20);

module.exports.setPlayerList = setPlayerList;
module.exports.setPlayer = setPlayer;
