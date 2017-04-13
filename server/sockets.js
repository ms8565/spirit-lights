
// fast hashing library
const xxh = require('xxhashjs');
// Player class
const Player = require('./classes/Player.js');
// our physics calculation file
const physics = require('./physics.js');

const LevelLoader = require('./levelLoader.js');

// object of user characters
let players = {};

// List of collidable objects
let collidables = [];

// let noncollidables = [];

// our socketio instance
let io;

// Possible actions a player can be doing.
// These are mapped
// to integers for fast/small storage
/* const actions = {
  LEFT: 1,
  RIGHT: 2,
  JUMP: 3,
  LIGHTUP: 4,
};*/

const updatePhysics = (playerList) => {
  players = playerList;

    // Update all player physics
  io.sockets.in('room1').emit('updatePhysics', { updatedPlayers: playerList });
};

// Will only be done once, since all levels use the same objects
const createLevel = (socket) => {
  // collidables.push(new Collidable('rock', 100, 400, 50, 50));
  // collidables.push(new Collidable('rock', 150, 400, 50, 50));
  // collidables.push(new Collidable('rock', 200, 400, 50, 50));
  // collidables.push(new Collidable('rock', 400, 400, 50, 50));

  collidables = LevelLoader.createLevel();

  physics.setCollidablesList(collidables);

  socket.emit('createLevel', { collidableObjs: collidables });
};

/* const loadMap = () => {
   const level1 = 390;
   const level2 = 350;
   const level3 = 200;
};*/

// function to setup our socket server
const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1'); // join user to our socket room

    // create a unique id for the user based on the socket id and time
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // create a new character and store it by its unique id
    players[hash] = new Player(hash);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    // emit a joined event to the user and send them their character
    socket.emit('joined', players[hash]);

    createLevel(socket);

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      // update the user's info
      // NOTICE: THIS IS NOT VALIDED AND IS UNSAFE
      players[socket.hash] = data;

      // if(players[socket.hash].velocityX > 10) players[socket.hash].velocityX = 10;
      // else if(players[socket.hash].velocityX < -10) players[socket.hash].velocityX = -10;


      if (physics.checkMoveX(players[socket.hash])) {
        // Player is colliding on x axis
        players[socket.hash].velocityX = 0;
      } else {
        // Player is not colliding on x axis
        players[socket.hash].destX = players[socket.hash].prevX + players[socket.hash].velocityX;
      }


      // update timestamp of last change for this character
      players[socket.hash].lastUpdate = new Date().getTime();


      physics.setPlayer(players[socket.hash]);

      // Update other players with movement
      io.sockets.in('room1').emit('updateMovement', players[socket.hash]);
    });

    socket.on('updateLight', (data) => {
      players[socket.hash] = data;
      physics.setPlayer(players[socket.hash]);

      io.sockets.in('room1').emit('updateMovement', players[socket.hash]);
    });
    socket.on('jump', () => {
      physics.playerJump(players[socket.hash]);

      io.sockets.in('room1').emit('updateMovement', players[socket.hash]);
    });

    socket.on('disconnect', () => {
      io.sockets.in('room1').emit('left', players[socket.hash]);

      delete players[socket.hash];
      physics.setPlayerList(players);

      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.updatePhysics = updatePhysics;
