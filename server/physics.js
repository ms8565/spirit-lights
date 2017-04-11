

// our socket code for physics to send updates back
const sockets = require('./sockets.js');

let playerList = {}; // list of Players

// box collision check between two rectangles
// of a set width/height
const isColliding = (player1, player2) => {
  if (player1.x < player2.x + player2.width &&
     player1.x + player1.width > player2.x &&
     player1.y < player2.y + player2.height &&
     player1.height + player1.y > player2.y) {
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
          players[keys[i]].velocityX = 0;
          players[keys[k]].velocityX = 0;
          console.log('players are colliding');
        } else {
          // console.log("players are not colliding");
        }
      }
    }
  }
};

//Check if new X update would cause the player to collide
const checkMoveX = (player) => {
  let newX = player.prevX + player.velocityX;
  const player1 = {x: newX, y: player.y, width: player.width, height: player.height};
  
  const keys = Object.keys(playerList);
  const players = playerList;

  for (let i = 0; i < keys.length; i++) {
    const player2 = {x: players[keys[i]].x, y: players[keys[i]].y, width: players[keys[i]].width, height: players[keys[i]].height};
    
    if(player.hash != players[keys[i]].hash){
      return isColliding(player1, player2);
    }
  }
  return false;
}

//Check if new Y update would cause the player to collide
const checkMoveY = (player) => {
  let newY = player.prevY + player.velocityY;
  
  //If the player is below the ground
  if(newY > 390){
    return true;
  }
  
  const player1 = {x: player.x, y: newY, width: player.width, height: player.height};
  
  const keys = Object.keys(playerList);
  const players = playerList;

  for (let i = 0; i < keys.length; i++) {
    const player2 = {x: players[keys[i]].x, y: players[keys[i]].y, width: players[keys[i]].width, height: players[keys[i]].height};
    
    if(player.hash != players[keys[i]].hash){
      return isColliding(player1, player2);
    }
  }
  return false;
}


// update player list
const setPlayerList = (newPlayerList) => {
  playerList = newPlayerList;
};

// update a player
const setPlayer = (player) => {
  playerList[player.hash] = player;
};

const playerJump = (player) => {
  // If the player isn't in the air
  if (!playerList[player.hash].inAir) {
    playerList[player.hash].velocityY += playerList[player.hash].jumpHeight;
    playerList[player.hash].inAir = true;
  } else {
    console.log(`velocity: ${playerList[player.hash].velocityY}`);
  }
};

const updatePhysics = () => {

  // gravity update physics
  const keys = Object.keys(playerList);
  for (let i = 0; i < keys.length; i++) {
    // If the player isn't below the ground or colliding with something below
    /*if (playerList[keys[i]].destY < 390) {
      playerList[keys[i]].velocityY += playerList[keys[i]].fallSpeed;
    } else {
      // playerList[keys[i]].velocityY = 0;
      playerList[keys[i]].destY = 390;
      playerList[keys[i]].inAir = false;
    }*/
    
    
    if (checkMoveY(playerList[keys[i]])){
        //Player is colliding on y axis
        playerList[keys[i]].velocityY = 0;
        playerList[keys[i]].inAir = false;
        playerList[keys[i]].destY = playerList[keys[i]].prevY;
      }
      else{
        //Player is not colliding on y axis
        playerList[keys[i]].velocityY += playerList[keys[i]].fallSpeed;
        
        if (playerList[keys[i]].velocityY > playerList[keys[i]].maxVelocityY) {
          playerList[keys[i]].velocityY = playerList[keys[i]].maxVelocityY;
        }
        
        playerList[keys[i]].destY = playerList[keys[i]].prevY + playerList[keys[i]].velocityY;
      }
    
    // if (playerList[keys[i]].destY <= 0) playerList[keys[i]].destY = 1;
    // if (playerList[keys[i]].destY >= 400) playerList[keys[i]].destY = 399;

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
module.exports.playerJump = playerJump;
module.exports.checkCollisions = checkPlayerCollisions;
module.exports.checkMoveX = checkMoveX;
