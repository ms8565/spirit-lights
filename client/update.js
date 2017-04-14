const endGame = () => {
  sunRising = true;
};

//when we receive a character update
const updateMovement = (data) => {
  //if we do not have that character (based on their id)
  //then add them
  if(!players[data.hash]) {
    players[data.hash] = data;
    return;
  }
    
  if(data.hash === hash) {
    return;
  }

  //if we received an old message, just drop it
  if(players[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  const player = players[data.hash];
  //update their action and movement information
  player.prevX = data.prevX;
  player.prevY = data.prevY;
  player.destX = data.destX;
  player.destY = data.destY;
  player.action = data.action;
  player.moveLeft = data.moveLeft;
  player.moveRight = data.moveRight;
  player.lightUp = data.lightUp;
  player.velocityY = data.velocityY;
  player.velocityX = data.velocityX;
    
  player.alpha = 0.05;
};

const updatePhysics = (data) => {
  const updatedPlayers = data.updatedPlayers;
  
  const keys = Object.keys(updatedPlayers);
  for (let i = 0; i < keys.length; i++){
    let player = updatedPlayers[keys[i]];
    
    if(!players[player.hash]) {
      players[player.hash] = player;
      return;
    }
    
    if(data.hash === hash) {
      return;
    }

    //if we received an old message, just drop it
    if(players[player.hash].lastUpdate >= player.lastUpdate) {
      return;
    }
    
    

    //grab the character based on the character id we received
    const updatedPlayer = players[player.hash];
    
    //update their direction and movement information
    //but NOT their x/y since we are animating those
    updatedPlayer.prevX = player.prevX;
    updatedPlayer.prevY = player.prevY;
    updatedPlayer.destX = player.destX;
    updatedPlayer.destY = player.destY;
    updatedPlayer.action = player.action;
    updatedPlayer.velocityY = player.velocityY;
    updatedPlayer.lightRadius = player.lightRadius;
    //player.velocityX = data.velocityX;

    updatedPlayer.alpha = 0.05;
  }
};

const respawnPlayer = (data) => {
  const hash = data.hash;
  const lastWayPoint = data.waypoint;
  
  players[hash].x = lastWayPoint;
  players[hash].prevX = lastWayPoint;
  players[hash].destX = lastWayPoint;
};

//function to remove a character from our character list
const removeUser = (data) => {
  //if we have that character, remove them
  if(players[data.hash]) {
    delete players[data.hash];
  }
};

//function to set this user's character
const setUser = (data) => {
  hash = data.hash; //set this user's hash to the unique one they received
  players[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

const sendJump = () => {
  const player = players[hash];
  
  //send request to server
  socket.emit('jump', player);
};
const sendRespawn = () => {
  const player = players[hash];
  
  //send request to server
  socket.emit('respawn', player);
};

const sendLightUp = () => {
  const player = players[hash];
  
  player.lightUp = true;
  player.action = actions.LIGHTUP;
  
  //send request to server
  socket.emit('updateLight', player);
};

const sendLightDown = () => {
  const player = players[hash];
  
  player.lightUp = false;
  player.action = actions.IDLE;
  
  //send request to server
  socket.emit('updateLight', player);
};

//update this user's positions based on keyboard input
const updatePosition = () => {
  const player = players[hash];

  //move the last x/y to our previous x/y variables
  player.prevX = player.x;
  player.prevY = player.y;

  let moving = false;

  //if user is moving left, decrease x
  if(player.moveLeft && player.x > 0 && !player.lightUp) {
    //player.destX -= 2;
    player.velocityX = -20;
    moving = true;
  }
  //if user is moving right, increase x
  if(player.moveRight && player.x < levelWidth && !player.lightUp) {
    //player.destX += 2;
    player.velocityX = 20;
    moving = true;
  }
  
  if(!moving) player.velocityX = 0

  if(player.lightUp){
    player.action = actions.LIGHTUP;
  }
  else if (player.moveLeft) {
    player.action = actions.LEFT;
  }
  else if (player.moveRight) {
    player.action = actions.RIGHT;
  }
  else{
      player.action = actions.IDLE;
  }

  //reset this character's alpha so they are always smoothly animating
  player.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', player);
};