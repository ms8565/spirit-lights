class BackgroundObject{
  constructor(x, y,width,height,image,depth){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.depth = depth;
  }
  draw(camera){
    ctx.drawImage(this.image,  this.x - camera.localX*(1/this.depth) + camera.worldX, this.y);
  }
}

class CollidableObject{
  constructor(x, y,width,height,image){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
  }
  draw(camera){
    ctx.drawImage(this.image,  this.x - camera.localX + camera.worldX, this.y);
  }
}

//Possible directions a user can move
//their character. These are mapped
//to integers for fast/small storage
const actions = {
  LEFT: 2,
  RIGHT: 1,
  JUMP: 3,
  CROUCH: 4
};

//size of our character sprites
const spriteSizes = {
  WIDTH: 64,
  HEIGHT: 64
};

//function to lerp (linear interpolation)
//Takes position one, position two and the 
//percentage of the movement between them (0-1)
const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const drawPlayer = (player, drawX) => {
  // if we are mid animation or moving in any direction
    if(player.frame > 0 || (player.moveUp || player.moveDown || player.moveRight || player.moveLeft)) {
      //increase our framecount
      player.frameCount++;

      //every 8 frames increase which sprite image we draw to animate
      //or reset to the beginning of the animation
      if(player.frameCount % 8 === 0) {
        if(player.frame < 9) {
          player.frame++;
        } else {
          player.frame = 0;
        }
      }
    }
  
  //draw our characters
      ctx.drawImage(
        walkImage, 
        spriteSizes.WIDTH * player.frame,
        spriteSizes.HEIGHT * player.action,
        spriteSizes.WIDTH, 
        spriteSizes.HEIGHT,
        drawX, 
        player.y, 
        spriteSizes.WIDTH, 
        spriteSizes.HEIGHT
      );
  
}

const drawPlayers = (camera) => {
  //each user id
  const keys = Object.keys(players);

  //for each player
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    //Draw player
    drawPlayer(player, player.x - camera.localX + camera.worldX);
    
    //highlight collision box for each character
    ctx.strokeRect(player.x - camera.localX + camera.worldX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }
}

const drawBackground = (camera) => {
  for(let i = backgrounds.length; i > 0; i--) {
     
     backgrounds[i-1].draw(camera);
  }  
}

const drawObjects = (camera) => {
  for(let i = 0; i < collidables.length; i++) {
    const collidable = collidables[i];
    const img = collidableSprites[collidables[i].type];
    ctx.drawImage(img,  
                  collidable.x - camera.localX + camera.worldX + collidable.width/2, 
                  collidable.y + collidable.height/2,
                  collidable.width,
                  collidable.height
                 );
    
  }
  
  
}

const drawForeground = () => {
  
}
const lerpPlayers = () => {
  //each user id
  const keys = Object.keys(players);
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    if(player.alpha < 1) player.alpha += 0.05;
    player.x = lerp(player.prevX, player.destX, player.alpha);
    player.y = lerp(player.prevY, player.destY, player.alpha);
    
  }
}

const setShadows = (camera) =>{
  let player = players[hash];
  let drawX = player.x + player.width/2 - camera.localX + camera.worldX;
  let radius = 100;
  
  //Create global shadow
  ctx2.globalCompositeOperation = 'source-over';
  ctx2.clearRect( 0, 0, canvas.width, canvas.height);
  ctx2.fillStyle = 'rgba( 0, 0, 0, .7 )';
  ctx2.fillRect ( 0, 0, canvas.width, canvas.height );
  
  //Create light gradient for each light
  var lightGrad = ctx2.createRadialGradient( drawX, player.y, 50, drawX, player.y, 100 );
  lightGrad.addColorStop(  0, 'rgba( 0, 0, 0,  1 )' );
  lightGrad.addColorStop( .8, 'rgba( 0, 0, 0, .1 )' );
  lightGrad.addColorStop(  1, 'rgba( 0, 0, 0,  0 )' );

  ctx2.globalCompositeOperation = 'destination-out';
  ctx2.fillStyle = lightGrad;
  ctx2.fillRect(drawX-radius, player.y - radius, radius*2, radius*2 );
}

//redraw with requestAnimationFrame
const redraw = (time) => {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  
  lerpPlayers();
  
  let player = players[hash];
  
  let camera = {localX: player.x, worldX: canvas.width/2};
  
  if(camera.localX < canvas.width/2){
    camera.localX = canvas.width/2;
  }
  else if(camera.localX > 2000){
    camera.localX = 2000;
  }
  
  
  
  
  drawBackground(camera);
  drawObjects(camera);
  drawPlayers(camera);
  
  
  setShadows(camera);
  
  
  

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};