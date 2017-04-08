"use strict";

//Possible directions a user can move
//their character. These are mapped
//to integers for fast/small storage
var actions = {
  LEFT: 1,
  RIGHT: 2,
  JUMP: 3,
  CROUCH: 4
};

//size of our character sprites
var spriteSizes = {
  WIDTH: 64,
  HEIGHT: 64
};

//function to lerp (linear interpolation)
//Takes position one, position two and the 
//percentage of the movement between them (0-1)
var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

//redraw with requestAnimationFrame
var redraw = function redraw(time) {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //Draw background
  ctx.drawImage(backgroundImage, 0, 0);

  //each user id
  var keys = Object.keys(squares);

  //for each user
  for (var i = 0; i < keys.length; i++) {
    var square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if (square.alpha < 1) square.alpha += 0.05;

    //applying a filter effect to other characters
    //in order to see our character easily
    if (square.hash === hash) {
      ctx.filter = "none";
    } else {
      ctx.filter = "hue-rotate(40deg)";
    }

    //calculate lerp of the x/y from the destinations
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    // if we are mid animation or moving in any direction
    if (square.frame > 0 || square.moveUp || square.moveDown || square.moveRight || square.moveLeft) {
      //increase our framecount
      square.frameCount++;

      //every 8 frames increase which sprite image we draw to animate
      //or reset to the beginning of the animation
      if (square.frameCount % 8 === 0) {
        if (square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }

    //draw our characters
    ctx.drawImage(walkImage, spriteSizes.WIDTH * square.frame, spriteSizes.HEIGHT * square.action, spriteSizes.WIDTH, spriteSizes.HEIGHT, square.x, square.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

    //highlight collision box for each character
    ctx.strokeRect(square.destX, square.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};
"use strict";

var canvas = void 0;
var ctx = void 0;
var walkImage = void 0; //spritesheet for player
var backgroundImage = void 0; //image for background
//our websocket connection 
var socket = void 0;
var hash = void 0; //user's unique id (from the server)
var animationFrame = void 0; //our next animation frame function

var squares = {}; //player list

var KEYBOARD = {
  "KEY_D": 68,
  "KEY_S": 83,
  "KEY_F": 70,
  "KEY_B": 66,
  "KEY_SHIFT": 16
};

//handle for key down events
var onKeyDown = function onKeyDown(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = true;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = true;
    }
  if (keyPressed === 32) {
    console.log("test");
    sendJump();
  }
};

//handler for key up events
var onKeyUp = function onKeyUp(e) {
  var keyPressed = e.which;
  var square = squares[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    square.moveLeft = false;
    console.log('Left Up');
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      square.moveRight = false;
      console.log('Right Up');
    }
};

var init = function init() {
  walkImage = document.querySelector('#walk');
  backgroundImage = document.querySelector('#background');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser); //when user joins
  socket.on('updateMovement', updateMovement); //when players move
  socket.on('updatePhysics', updatePhysics); //after physics updates
  socket.on('left', removeUser); //when a user leaves

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
};

window.onload = init;
'use strict';

//when we receive a character update
var updateMovement = function updateMovement(data) {
  //if we do not have that character (based on their id)
  //then add them
  if (!squares[data.hash]) {
    squares[data.hash] = data;
    return;
  }

  if (data.hash === hash) {
    return;
  }

  //if we received an old message, just drop it
  if (squares[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  var square = squares[data.hash];
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

var updatePhysics = function updatePhysics(data) {
  var updatedPlayers = data.updatedPlayers;

  var keys = Object.keys(updatedPlayers);
  for (var i = 0; i < keys.length; i++) {
    var player = updatedPlayers[keys[i]];

    if (!squares[player.hash]) {
      squares[player.hash] = player;
      return;
    }

    if (data.hash === hash) {
      return;
    }

    //if we received an old message, just drop it
    if (squares[player.hash].lastUpdate >= player.lastUpdate) {
      return;
    }

    //grab the character based on the character id we received
    var square = squares[player.hash];
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
};

//function to remove a character from our character list
var removeUser = function removeUser(data) {
  //if we have that character, remove them
  if (squares[data.hash]) {
    delete squares[data.hash];
  }
};

//function to set this user's character
var setUser = function setUser(data) {
  hash = data.hash; //set this user's hash to the unique one they received
  squares[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

var sendJump = function sendJump() {
  var square = squares[hash];

  //send request to server
  socket.emit('jump', square);
};

//update this user's positions based on keyboard input
var updatePosition = function updatePosition() {
  var square = squares[hash];

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
  if (square.moveLeft && square.x > 0) {
    //console.log("r u MOVVING LEFT?");
    square.destX -= 2;
  }
  //if user is moving right, increase x
  if (square.moveRight && square.x < 1000) {
    //console.log("moving right, HUH BUB??");
    square.destX += 2;
  }

  if (square.moveLeft) {
    square.action = actions.LEFT;
  }

  if (square.moveRight) {
    square.action = actions.RIGHT;
  }

  //reset this character's alpha so they are always smoothly animating
  square.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', square);
};
