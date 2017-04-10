let canvas;
let canvas2;
let ctx;
let ctx2;
let walkImage; //spritesheet for player
let backgroundImage; //image for background

let backgrounds = [];
//our websocket connection 
let socket; 
let hash; //user's unique id (from the server)
let animationFrame; //our next animation frame function

let players = {}; //player list

var KEYBOARD = {
	"KEY_D": 68, 
	"KEY_S": 83, 
	"KEY_F": 70, 
	"KEY_B": 66,
	"KEY_SHIFT":16
};

//handle for key down events
const onKeyDown = (e) => {
  var keyPressed = e.which;
  const player = players[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = true;
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    player.moveRight = true;
  }
  if(keyPressed === 32) {
    console.log("test");
    sendJump();
  }
};

//handler for key up events
const onKeyUp = (e) => {
  var keyPressed = e.which;
  const player = players[hash];

  // A OR LEFT
  if(keyPressed === 65 || keyPressed === 37) {
    player.moveLeft = false;
    console.log('Left Up');
  }
  // D OR RIGHT
  else if(keyPressed === 68 || keyPressed === 39) {
    player.moveRight = false;
    console.log('Right Up');
  }
};

const init = () => {
  walkImage = document.querySelector('#walk');
  backgroundImage = document.querySelector('#background2');
  
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');
  
  canvas2 = document.querySelector('#canvas2');
  ctx2 = canvas2.getContext('2d');
  
  for(let i = 2; i < 11; i++){
    let img = document.querySelector('#background'+i);
    let sprite = new BackgroundObject(0,-280, 1638, 500, img, i-1);
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