//when we receive a character update
const updateMovement = (data) => {
  //if we do not have that character (based on their id)
  //then add them
  if(!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }
    
  if(data.hash === hash) {
    return;
  }

  //if we received an old message, just drop it
  if(squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  const square = squares[data.hash];
  //update their action and movement information
  square.prevX = data.prevX;
  square.prevY = data.prevY;
  square.destX = data.destX;
  square.destY = data.destY;
  square.action = data.action;
  square.moveLeft = data.moveLeft;
  square.moveRight = data.moveRight;
  square.velocityY = data.velocityY;
    
  square.alpha = 0.05;
};

const updatePhysics = (data) => {
  const updatedPlayers = data.updatedPlayers;
  
  const keys = Object.keys(updatedPlayers);
  for (let i = 0; i < keys.length; i++){
    let player = updatedPlayers[keys[i]];
    
    if(!squares[player.hash]) {
      squares[player.hash] = player;
      return;
    }
    
    if(data.hash === hash) {
      return;
    }

    //if we received an old message, just drop it
    if(squares[player.hash].lastUpdate >= player.lastUpdate) {
      return;
    }
    
    

    //grab the character based on the character id we received
    const square = squares[player.hash];
    //update their direction and movement information
    //but NOT their x/y since we are animating those
    square.prevX = player.prevX;
    square.prevY = player.prevY;
    square.destX = player.destX;
    square.destY = player.destY;
    square.action = player.action;
    //square.moveLeft = player.moveLeft;
    //square.moveRight = player.moveRight;
    square.velocityY = player.velocityY;

    square.alpha = 0.05;
  }
}

//function to remove a character from our character list
const removeUser = (data) => {
  //if we have that character, remove them
  if(squares[data.hash]) {
    delete squares[data.hash];
  }
};

//function to set this user's character
const setUser = (data) => {
  hash = data.hash; //set this user's hash to the unique one they received
  squares[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

const sendJump = () => {
  const square = squares[hash];
  
  //send request to server
  socket.emit('jump', square);
};

//update this user's positions based on keyboard input
const updatePosition = () => {
  const square = squares[hash];

  //move the last x/y to our previous x/y variables
  square.prevX = square.x;
  square.prevY = square.y;
  
  /*square.destY+= square.velocityY;
  if(square.destY <= 0) square.destY = 1;
  if(square.destY >= 400) square.destY = 399;

  //if user is moving left, decrease x
  if(square.moveLeft && square.destX > 0) {
    console.log("moving left");
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if(square.moveRight && square.destX < 1000) {
    console.log("moving right");
      square.destX += 2;
  }*/

  

  //if user is moving left, decrease x
  if(square.moveLeft && square.x > 0) {
    //console.log("r u MOVVING LEFT?");
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if(square.moveRight && square.x < 1000) {
    //console.log("moving right, HUH BUB??");
    square.destX += 2;
  }

  if(square.moveLeft){ 
    square.action = actions.LEFT;
    
  }

  if(square.moveRight){ 
    square.action = actions.RIGHT;
    
  }

  //reset this character's alpha so they are always smoothly animating
  square.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', square);
};