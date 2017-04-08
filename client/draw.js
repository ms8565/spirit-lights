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

//redraw with requestAnimationFrame
const redraw = (time) => {
  //update this user's positions
  updatePosition();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
    
  //Draw background
  ctx.drawImage(backgroundImage, 0, 0);

  //each user id
  const keys = Object.keys(squares);

  //for each user
  for(let i = 0; i < keys.length; i++) {
    const square = squares[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if(square.alpha < 1) square.alpha += 0.05;

    //applying a filter effect to other characters
    //in order to see our character easily
    if(square.hash === hash) {
      ctx.filter = "none"
    }
    else {
      ctx.filter = "hue-rotate(40deg)";
    }

    //calculate lerp of the x/y from the destinations
    square.x = lerp(square.prevX, square.destX, square.alpha);
    square.y = lerp(square.prevY, square.destY, square.alpha);

    // if we are mid animation or moving in any direction
    if(square.frame > 0 || (square.moveUp || square.moveDown || square.moveRight || square.moveLeft)) {
      //increase our framecount
      square.frameCount++;

      //every 8 frames increase which sprite image we draw to animate
      //or reset to the beginning of the animation
      if(square.frameCount % 8 === 0) {
        if(square.frame < 7) {
          square.frame++;
        } else {
          square.frame = 0;
        }
      }
    }

    //draw our characters
    ctx.drawImage(
      walkImage, 
      spriteSizes.WIDTH * square.frame,
      spriteSizes.HEIGHT * square.action,
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT,
      square.x, 
      square.y, 
      spriteSizes.WIDTH, 
      spriteSizes.HEIGHT
    );
    
    //highlight collision box for each character
    ctx.strokeRect(square.destX, square.destY, spriteSizes.WIDTH, spriteSizes.HEIGHT);
  }

  //set our next animation frame
  animationFrame = requestAnimationFrame(redraw);
};