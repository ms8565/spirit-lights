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

const drawPlayers = (camera) => {

  
  //each user id
  const keys = Object.keys(players);

  //for each player
  
  for(let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];

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

    //applying a filter effect to other characters
    //in order to see our character easily
    if(player.hash === hash) {
      ctx.filter = "none";
      
      let drawX = canvas.width/2;

      if(player.x < camera.x){ 
        drawX = player.x;
      }
      if(player.x > camera.x){
        drawX = player.x - camera.x;
      }
      let destDifference = player.x - player.destX;
      let destX = drawX - destDifference;
      
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
      
      
    
      //highlight collision box for each character
      ctx.strokeRect(destX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
    }
    else {
      ctx.filter = "hue-rotate(40deg)";
      
      //if alpha less than 1, increase it by 0.01
      if(player.alpha < 1) player.alpha += 0.05;
      
      //calculate lerp of the x/y from the destinations
      player.x = lerp(player.prevX, player.destX, player.alpha);
      player.y = lerp(player.prevY, player.destY, player.alpha);
      
      //draw our characters
      ctx.drawImage(
        walkImage, 
        spriteSizes.WIDTH * player.frame,
        spriteSizes.HEIGHT * player.action,
        spriteSizes.WIDTH, 
        spriteSizes.HEIGHT,
        player.x - camera.x, 
        player.y, 
        spriteSizes.WIDTH, 
        spriteSizes.HEIGHT
      );
    
      //highlight collision box for each character
      ctx.strokeRect(player.destX, player.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
    }  
  }
}
const drawBackground = (camera) => {
  
  ctx.drawImage(backgroundImage, 0-camera.x, 0);
}
const drawMidground = () => {
  
}
const drawForeground = () => {
  
}

//redraw with requestAnimationFrame
const redraw = (time) => {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  let player = players[hash];
  if(player.alpha < 1) player.alpha += 0.05;
  player.x = lerp(player.prevX, player.destX, player.alpha);
  player.y = lerp(player.prevY, player.destY, player.alpha);
  
  let camera = {x: 0};
  camera.x = player.x;
  
  if(camera.x < canvas.width/2){
    camera.x = canvas.width/2;
  }
  
  
  drawBackground(camera);
  drawPlayers(camera);
  

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};