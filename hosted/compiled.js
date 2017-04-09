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

var drawPlayers = function drawPlayers(camera) {

  //each user id
  var keys = Object.keys(players);

  //for each player

  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];

    // if we are mid animation or moving in any direction
    if (player.frame > 0 || player.moveUp || player.moveDown || player.moveRight || player.moveLeft) {
      //increase our framecount
      player.frameCount++;

      //every 8 frames increase which sprite image we draw to animate
      //or reset to the beginning of the animation
      if (player.frameCount % 8 === 0) {
        if (player.frame < 7) {
          player.frame++;
        } else {
          player.frame = 0;
        }
      }
    }

    //applying a filter effect to other characters
    //in order to see our character easily
    if (player.hash === hash) {
      ctx.filter = "none";

      var drawX = canvas.width / 2;

      if (player.x < camera.x) {
        drawX = player.x;
      }
      if (player.x > camera.x) {
        drawX = player.x - camera.x;
      }
      var destDifference = player.x - player.destX;
      var destX = drawX - destDifference;

      //draw our characters
      ctx.drawImage(walkImage, spriteSizes.WIDTH * player.frame, spriteSizes.HEIGHT * player.action, spriteSizes.WIDTH, spriteSizes.HEIGHT, drawX, player.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

      //highlight collision box for each character
      ctx.strokeRect(destX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
    } else {
      ctx.filter = "hue-rotate(40deg)";

      //if alpha less than 1, increase it by 0.01
      if (player.alpha < 1) player.alpha += 0.05;

      //calculate lerp of the x/y from the destinations
      player.x = lerp(player.prevX, player.destX, player.alpha);
      player.y = lerp(player.prevY, player.destY, player.alpha);

      //draw our characters
      ctx.drawImage(walkImage, spriteSizes.WIDTH * player.frame, spriteSizes.HEIGHT * player.action, spriteSizes.WIDTH, spriteSizes.HEIGHT, player.x - camera.x, player.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);

      //highlight collision box for each character
      ctx.strokeRect(player.destX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
    }
  }
};
var drawBackground = function drawBackground(camera) {

  ctx.drawImage(backgroundImage, 0 - camera.x, 0);
};
var drawMidground = function drawMidground() {};
var drawForeground = function drawForeground() {};

//redraw with requestAnimationFrame
var redraw = function redraw(time) {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var player = players[hash];
  if (player.alpha < 1) player.alpha += 0.05;
  player.x = lerp(player.prevX, player.destX, player.alpha);
  player.y = lerp(player.prevY, player.destY, player.alpha);

  var camera = { x: 0 };
  camera.x = player.x;

  if (camera.x < canvas.width / 2) {
    camera.x = canvas.width / 2;
  }

  drawBackground(camera);
  drawPlayers(camera);

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

var players = {}; //player list

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
  var player = players[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = true;
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      player.moveRight = true;
    }
  if (keyPressed === 32) {
    console.log("test");
    sendJump();
  }
};

//handler for key up events
var onKeyUp = function onKeyUp(e) {
  var keyPressed = e.which;
  var player = players[hash];

  // A OR LEFT
  if (keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = false;
    console.log('Left Up');
  }
  // D OR RIGHT
  else if (keyPressed === 68 || keyPressed === 39) {
      player.moveRight = false;
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
  if (!players[data.hash]) {
    players[data.hash] = data;
    return;
  }

  if (data.hash === hash) {
    return;
  }

  //if we received an old message, just drop it
  if (players[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  var player = players[data.hash];
  //update their action and movement information
  player.prevX = data.prevX;
  player.prevY = data.prevY;
  player.destX = data.destX;
  player.destY = data.destY;
  player.action = data.action;
  player.moveLeft = data.moveLeft;
  player.moveRight = data.moveRight;
  player.velocityY = data.velocityY;

  player.alpha = 0.05;
};

var updatePhysics = function updatePhysics(data) {
  var updatedPlayers = data.updatedPlayers;

  var keys = Object.keys(updatedPlayers);
  for (var i = 0; i < keys.length; i++) {
    var player = updatedPlayers[keys[i]];

    if (!players[player.hash]) {
      players[player.hash] = player;
      return;
    }

    if (data.hash === hash) {
      return;
    }

    //if we received an old message, just drop it
    if (players[player.hash].lastUpdate >= player.lastUpdate) {
      return;
    }

    //grab the character based on the character id we received
    var updatedPlayer = players[player.hash];

    //update their direction and movement information
    //but NOT their x/y since we are animating those
    updatedPlayer.prevX = player.prevX;
    updatedPlayer.prevY = player.prevY;
    updatedPlayer.destX = player.destX;
    updatedPlayer.destY = player.destY;
    updatedPlayer.action = player.action;
    updatedPlayer.velocityY = player.velocityY;

    updatedPlayer.alpha = 0.05;
  }
};

//function to remove a character from our character list
var removeUser = function removeUser(data) {
  //if we have that character, remove them
  if (players[data.hash]) {
    delete players[data.hash];
  }
};

//function to set this user's character
var setUser = function setUser(data) {
  hash = data.hash; //set this user's hash to the unique one they received
  players[hash] = data; //set the character by their hash
  requestAnimationFrame(redraw); //start animating
};

var sendJump = function sendJump() {
  var player = players[hash];

  //send request to server
  socket.emit('jump', player);
};

//update this user's positions based on keyboard input
var updatePosition = function updatePosition() {
  var player = players[hash];

  //move the last x/y to our previous x/y variables
  player.prevX = player.x;
  player.prevY = player.y;

  /*player.destY+= player.velocityY;
  if(player.destY <= 0) player.destY = 1;
  if(player.destY >= 400) player.destY = 399;
   //if user is moving left, decrease x
  if(player.moveLeft && player.destX > 0) {
    console.log("moving left");
    player.destX -= 2;
  }
  //if user is moving right, increase x
  if(player.moveRight && player.destX < 1000) {
    console.log("moving right");
      player.destX += 2;
  }*/

  //if user is moving left, decrease x
  if (player.moveLeft && player.x > 0) {
    player.destX -= 2;
  }
  //if user is moving right, increase x
  if (player.moveRight && player.x < 1000) {
    player.destX += 2;
  }

  if (player.moveLeft) {
    player.action = actions.LEFT;
  }

  if (player.moveRight) {
    player.action = actions.RIGHT;
  }

  //reset this character's alpha so they are always smoothly animating
  player.alpha = 0.05;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', player);
};
