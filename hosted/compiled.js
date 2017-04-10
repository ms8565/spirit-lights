'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BackgroundObject = function () {
  function BackgroundObject(x, y, width, height, image, depth) {
    _classCallCheck(this, BackgroundObject);

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.depth = depth;
  }

  _createClass(BackgroundObject, [{
    key: 'draw',
    value: function draw(camera) {
      ctx.drawImage(this.image, this.x - camera.localX * (1 / this.depth) + camera.worldX, this.y);
    }
  }]);

  return BackgroundObject;
}();

//Possible directions a user can move
//their character. These are mapped
//to integers for fast/small storage


var actions = {
  LEFT: 2,
  RIGHT: 1,
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

var drawPlayer = function drawPlayer(player, drawX) {
  // if we are mid animation or moving in any direction
  if (player.frame > 0 || player.moveUp || player.moveDown || player.moveRight || player.moveLeft) {
    //increase our framecount
    player.frameCount++;

    //every 8 frames increase which sprite image we draw to animate
    //or reset to the beginning of the animation
    if (player.frameCount % 8 === 0) {
      if (player.frame < 9) {
        player.frame++;
      } else {
        player.frame = 0;
      }
    }
  }

  //draw our characters
  ctx.drawImage(walkImage, spriteSizes.WIDTH * player.frame, spriteSizes.HEIGHT * player.action, spriteSizes.WIDTH, spriteSizes.HEIGHT, drawX, player.y, spriteSizes.WIDTH, spriteSizes.HEIGHT);
};

var drawPlayers = function drawPlayers(camera) {
  //each user id
  var keys = Object.keys(players);

  //for each player

  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];

    //Draw player
    drawPlayer(player, player.x - camera.localX + camera.worldX);

    //highlight collision box for each character
    ctx.strokeRect(player.x - camera.localX + camera.worldX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }
};

var drawBackground = function drawBackground(camera) {
  for (var i = backgrounds.length; i > 0; i--) {

    backgrounds[i - 1].draw(camera);
  }
};
var drawForeground = function drawForeground() {};
var lerpPlayers = function lerpPlayers() {
  //each user id
  var keys = Object.keys(players);

  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];

    if (player.alpha < 1) player.alpha += 0.05;
    player.x = lerp(player.prevX, player.destX, player.alpha);
    player.y = lerp(player.prevY, player.destY, player.alpha);
  }
};

var setShadows = function setShadows(camera) {
  var player = players[hash];
  var drawX = player.x + player.width / 2 - camera.localX + camera.worldX;
  var radius = 100;

  //Create global shadow
  ctx2.globalCompositeOperation = 'source-over';
  ctx2.clearRect(0, 0, canvas.width, canvas.height);
  ctx2.fillStyle = 'rgba( 0, 0, 0, .7 )';
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

  //Create light gradient for each light
  var lightGrad = ctx2.createRadialGradient(drawX, player.y, 50, drawX, player.y, 100);
  lightGrad.addColorStop(0, 'rgba( 0, 0, 0,  1 )');
  lightGrad.addColorStop(.8, 'rgba( 0, 0, 0, .1 )');
  lightGrad.addColorStop(1, 'rgba( 0, 0, 0,  0 )');

  ctx2.globalCompositeOperation = 'destination-out';
  ctx2.fillStyle = lightGrad;
  ctx2.fillRect(drawX - radius, player.y - radius, radius * 2, radius * 2);
};

//redraw with requestAnimationFrame
var redraw = function redraw(time) {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  lerpPlayers();

  var player = players[hash];

  var camera = { localX: player.x, worldX: canvas.width / 2 };

  if (camera.localX < canvas.width / 2) {
    camera.localX = canvas.width / 2;
  } else if (camera.localX > 2000) {
    camera.localX = 2000;
  }

  drawBackground(camera);
  drawPlayers(camera);

  setShadows(camera);

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};
"use strict";

var canvas = void 0;
var canvas2 = void 0;
var ctx = void 0;
var ctx2 = void 0;
var walkImage = void 0; //spritesheet for player
var backgroundImage = void 0; //image for background

var backgrounds = [];
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
  backgroundImage = document.querySelector('#background2');

  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  canvas2 = document.querySelector('#canvas2');
  ctx2 = canvas2.getContext('2d');

  for (var i = 2; i < 11; i++) {
    var img = document.querySelector('#background' + i);
    var sprite = new BackgroundObject(0, -280, 1638, 500, img, i - 1);
    //let wrapSprite = new BackgroundObject(0,-280, 1638, 500, img, i-1);

    backgrounds.push(sprite);
  }

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
  player.velocityX = data.velocityX;

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
    //player.velocityX = data.velocityX;

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

  var moving = false;

  //if user is moving left, decrease x
  if (player.moveLeft && player.x > 0) {
    //player.destX -= 2;
    player.velocityX = -20;
    moving = true;
  }
  //if user is moving right, increase x
  if (player.moveRight && player.x < 2000) {
    //player.destX += 2;
    player.velocityX = 20;
    moving = true;
  }

  if (!moving) player.velocityX = 0;

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
