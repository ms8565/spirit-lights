let sunRising = false;
let dawnOpacity = 0;
let darknessLevel = .8;

class BackgroundObject{
  constructor(x, y,width,height,image,depth){
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.depth = depth;
    this.dawnImage = waypointImage;
  }
  draw(camera){
    ctx.drawImage(this.image,  this.x - camera.gameX*(1/this.depth) + camera.canvasX, this.y);
    
    //If the player has reached the end of the game
    //Fade in dawn images
    if(sunRising){
      ctx.save();
      ctx.globalAlpha = dawnOpacity;
      ctx.drawImage(this.dawnImage,  this.x - camera.gameX*(1/this.depth) + camera.canvasX, this.y);
      ctx.restore();
    }
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
    ctx.drawImage(this.image,  this.x - camera.gameX + camera.canvasX, this.y);
  }
}

//Possible directions a user can move
//their character. These are mapped
//to integers for fast/small storage
const actions = {
  IDLE: 0,
  LEFT: 3,
  RIGHT: 2,
  JUMP: 4,
  LIGHTUP: 1
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
    if(player.frame > 0 || (player.moveRight || player.moveLeft)) {
      //increase our framecount
      player.frameCount++;

      //every 8 frames increase which sprite image we draw to animate
      //or reset to the beginning of the animation
      if(player.frameCount % 8 === 0) {
        if(player.frame < 9) {
          player.frame++;
        } else {
          
          //If the player is lighting, then they should stay in that pose
          if(player.action !== actions.LIGHTUP){
            player.frame = 0;
          }
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
        drawX - 16, 
        player.y - 32, 
        spriteSizes.WIDTH, 
        spriteSizes.HEIGHT
      );
  
};

const drawPlayers = (camera) => {
  //each user id
  const keys = Object.keys(players);

  //for each player
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    //Draw player
    drawPlayer(player, player.x - camera.gameX + camera.canvasX);
    
    //highlight collision box for each character
    //ctx.strokeRect(player.x - camera.gameX + camera.canvasX - 16, player.destY - 32, spriteSizes.WIDTH/2, spriteSizes.HEIGHT/2);
  }
};

const drawBackground = (camera) => {
  for(let i = backgrounds.length; i > 0; i--) {
     
     backgrounds[i-1].draw(camera);
  }
};

const drawWaypoints = (camera) => {
    for(let i = 0; i < collidables.length; i++) {
      let drawX = waypoints[i] - camera.gameX + camera.canvasX;
      
      ctx.drawImage(waypointImage, drawX, 390);
      
    }
  let drawX = 4300 - camera.gameX + camera.canvasX;
  ctx.drawImage(shrineImage, drawX, 300);
};

const drawObjects = (camera) => {

  for(let i = 0; i < collidables.length; i++) {
    const collidable = collidables[i];
    
    const img = collidableSprites[collidables[i].type];
    
    //Hot fix for offset bug due to x/y being at 0,0
    if(collidable.type === 'branch1'){
      ctx.drawImage(img,  
                  collidable.x - camera.gameX + camera.canvasX, 
                  collidable.y - 40);
    }
    else if(collidable.type === 'branch2'){
      ctx.drawImage(img,  
                  collidable.x - camera.gameX + camera.canvasX, 
                  collidable.y - 20);
    }
    else{
      ctx.drawImage(img,  
                  collidable.x - camera.gameX + camera.canvasX, 
                  collidable.y - 8);
    }
    
  }
  
};

const drawForeground = (camera) => {
  for(let i = foregrounds.length; i > 0; i--) {
     foregrounds[i-1].draw(camera);
  }
};


const lerpPlayers = () => {
  //each user id
  const keys = Object.keys(players);
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];
    
    
    if(player.alpha < 1) player.alpha += 0.05;
    player.x = lerp(player.prevX, player.destX, player.alpha);
    player.y = lerp(player.prevY, player.destY, player.alpha);
    
  }
};

const setShadows = (camera) =>{
  
  let radius = 100;
  
  //Create global shadow
  ctx2.globalCompositeOperation = 'source-over';
  ctx2.clearRect( 0, 0, canvas.width, canvas.height);
  ctx2.fillStyle = 'rgba( 0, 0, 0,'+darknessLevel+' )';
  ctx2.fillRect ( 0, 0, canvas.width, canvas.height );
  
  //Create light gradient for each player light
  const keys = Object.keys(players);
  
  for(let i = 0; i < keys.length; i++) {
    let player = players[[keys[i]]];
    let drawX = player.x + player.width/2 - camera.gameX + camera.canvasX;
    
    let lightGrad = ctx2.createRadialGradient( drawX, player.y, player.lightRadius/2, drawX, player.y, player.lightRadius );
    
    lightGrad.addColorStop(  0, 'rgba( 6, 193, 180,  .8 )' );
      lightGrad.addColorStop( .8, 'rgba( 100, 50, 80, .1 )' );
      lightGrad.addColorStop(  1, 'rgba( 0, 0, 0,  0 )' );
    
    ctx2.globalCompositeOperation = 'destination-out';
    ctx2.fillStyle = lightGrad;
    ctx2.fillRect(drawX-player.lightRadius, player.y - player.lightRadius, player.lightRadius*2, player.lightRadius*2 );
    
    //Draw colored light
    if(players[keys[i]].lightUp){
      ctx2.globalCompositeOperation = 'source-atop';
      ctx2.fillStyle = lightGrad;
      ctx2.fillRect(drawX-player.lightRadius, player.y - player.lightRadius, player.lightRadius*2, player.lightRadius*2 );
    }
  }
  
  //Create light gradient for each waypoint
  for(let i = 0; i < 6; i++) {
    
    let drawX = waypoints[i] - camera.gameX + camera.canvasX + 20;
    
    //If the lantern is onscreen or close to it
    if((drawX < canvas.width + 100) && (drawX > -100) ){
      let drawY = 420;
      let radius = 50;
    
      let lightGrad = ctx2.createRadialGradient( drawX, drawY, radius/2, drawX, drawY, radius );
    
      lightGrad.addColorStop(  0, 'rgba( 6, 193, 147,  .7 )' );
      lightGrad.addColorStop( .4, 'rgba( 6, 193, 147, .4 )' );
      lightGrad.addColorStop(  1, 'rgba( 0, 0, 0,  0 )' );
    
      ctx2.globalCompositeOperation = 'destination-out';
      ctx2.fillStyle = lightGrad;
      ctx2.fillRect(drawX - radius, drawY - radius, radius*2, radius*2 );
    
      //Draw colored light
      ctx2.globalCompositeOperation = 'source-atop';
      ctx2.fillStyle = lightGrad;
      ctx2.fillRect(drawX - radius, drawY - radius, radius*2, radius*2 );
    }
  }
  let drawXShrine = 4400 - camera.gameX + camera.canvasX;
  let drawYShrine = 420;
  let radiusShrine = 200;

  let lightGrad = ctx2.createRadialGradient( drawXShrine, drawYShrine, radiusShrine/2, drawXShrine, drawYShrine, radiusShrine );

  lightGrad.addColorStop(  0, 'rgba( 244, 200, 66,  .7 )' );
  lightGrad.addColorStop( .4, 'rgba(244, 200, 66, .4 )' );
  lightGrad.addColorStop(  1, 'rgba( 0, 0, 0,  0 )' );

  ctx2.globalCompositeOperation = 'destination-out';
  ctx2.fillStyle = lightGrad;
  ctx2.fillRect(drawXShrine - radiusShrine, drawYShrine - radiusShrine, radiusShrine*2, radiusShrine*2 );

  //Draw colored light
  ctx2.globalCompositeOperation = 'source-atop';
  ctx2.fillStyle = lightGrad;
  ctx2.fillRect(drawXShrine - radiusShrine, drawYShrine - radiusShrine, radiusShrine*2, radiusShrine*2 );
};



//redraw with requestAnimationFrame
const redraw = (time) => {
  //update this user's positions
  //updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  
  lerpPlayers();
  
  let player = players[hash];
  
  let camera = {gameX: player.x, canvasX: canvas.width/2};
  
  if(camera.gameX < canvas.width/2){
    camera.gameX = canvas.width/2;
  }
  else if(camera.gameX > levelWidth - canvas.width/2){
    camera.gameX = levelWidth - canvas.width/2;
  }
  
  drawBackground(camera);
  drawWaypoints(camera);
  drawObjects(camera);
  drawPlayers(camera);
  drawForeground(camera);
  
  
  setShadows(camera);
  
  if(sunRising){
    dawnOpacity+=.005;
    darknessLevel-=.005;
    
    if(dawnOpacity >=1){
      ctx.save();
      ctx.globalAlpha = endFadeIn;
      ctx.drawImage(endingImage, 0, 0);
      ctx.restore();

      endFadeIn+=.005;
    }
    
  }
  
  

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};