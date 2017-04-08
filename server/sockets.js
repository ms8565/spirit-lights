
// fast hashing library
const xxh = require('xxhashjs');
// Character custom class
const Player = require('./classes/Player.js');
// our physics calculation file
const physics = require('./physics.js');

// object of user characters
const players = {};

// our socketio instance
let io;

// Possible actions a player can be doing.
// These are mapped
// to integers for fast/small storage
/* const actions = {
  LEFT: 1,
  RIGHT: 2,
  JUMP: 3,
  CROUCH: 4,
};*/

const updatePhysics = (playerList) => {
    // players = playerList;

    // Update all player physics
  io.sockets.in('room1').emit('updatePhysics', { updatedPlayers: playerList });
};

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

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      // update the user's info
      // NOTICE: THIS IS NOT VALIDED AND IS UNSAFE
      players[socket.hash] = data;

      // update timestamp of last change for this character
      players[socket.hash].lastUpdate = new Date().getTime();


      physics.setPlayer(players[socket.hash]);


      // Update other players with movement
      io.sockets.in('room1').emit('updateMovement', players[socket.hash]);
    });

    socket.on('jump', () => {
      console.log('jump');

        // players[socket.hash].jump();
      players[socket.hash].velocityY += players[socket.hash].jumpHeight;
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
