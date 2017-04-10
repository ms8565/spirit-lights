//Possible directions a user can move
//their character. These are mapped
//to integers for fast/small storage
 const actions = {
  LEFT: 1,
  RIGHT: 2,
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
        if(player.frame < 7) {
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
  
  ctx.drawImage(backgroundImage,  canvas.width/2 - camera.localX, 0);
}
const drawMidground = () => {
  
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
  else if(camera.localX > 900){
    camera.localX = 900;
  }
  
  
  drawBackground(camera);
  drawPlayers(camera);
  

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};