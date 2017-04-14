

// fast hashing library
const xxh = require('xxhashjs');
// Player class
const Player = require('./classes/Player.js');
// Room class
const Room = require('./classes/Room.js');
// our physics calculation file
const physics = require('./physics.js');

const LevelLoader = require('./levelLoader.js');
let objectsLoaded = false;

// List of player rooms
const rooms = {};

// List of collidable objects
let collidables = [];

// let nonCollidables = [];
let waypoints = [];

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

const updatePhysics = (playerList, roomName) => {
  rooms[roomName].players = playerList;
  const players = rooms[roomName].players;

  const keys = Object.keys(players);
  // If the player is dead, respawn them
  for (let i = 0; i < keys.length; i++) {
    if (players[keys[i]].dead) {
      const pHash = players[keys[i]].hash;
      const wPoint = players[keys[i]].lastWaypoint;

      io.sockets.in(roomName).emit('respawnPlayer', { hash: pHash, waypoint: wPoint });
    }
  }

  // Update all player physics
  io.sockets.in(roomName).emit('updatePhysics', { updatedPlayers: playerList });
};

// Will only be done once, since all levels use the same objects
const createLevel = (socket) => {
  LevelLoader.createLevel();

  if (!objectsLoaded) {
    collidables = LevelLoader.getCollidables();
    // nonCollidables = LevelLoader.getNonCollidables();
    waypoints = LevelLoader.getWaypoints();
    objectsLoaded = true;
  }

  physics.setCollidablesList(collidables);

  socket.emit('createLevel', { collidableObjs: collidables, wayPoints: waypoints });
};

const checkWaypoints = (socket) => {
  const hash = socket.hash;
  const room = rooms[socket.roomName];
  // Check if player is at the end of the game
  // Aka, the last waypoint
  if (room.players[hash].x > waypoints[waypoints.length - 1]) {
    const keys = Object.keys(room.players);

    // Check if another player is at the end
    for (let i = 0; i < keys.length; i++) {
      const otherPlayer = room.players[[keys[i]]];

       // If it's not the current player
      if (otherPlayer.hash !== hash) {
         // Check if another player is past the last waypoint
        if (otherPlayer.x > waypoints[waypoints.length - 1]) {
          socket.emit('endGame', null);
        }
      }
    }
  }

  // Loop through the other waypoints
  for (let i = waypoints.length - 1; i > 0; i--) {
    const waypoint = waypoints[i - 1];
    if (room.players[hash].x > waypoint) {
      // If the player is past the waypoint
      // Set that as the last waypoint
      room.players[hash].lastWaypoint = waypoint;
      break;
    }
  }
};


const addUserToRoom = (sock) => {
  const socket = sock;

  let added = false;

  const keys = Object.keys(rooms);

  for (let i = 0; i < keys.length; i++) {
    // Check if a room has an open spot
    if (rooms[keys[i]].numUsers < 2) {
      socket.roomName = keys[i];
      rooms[keys[i]].numUsers++;

      added = true;
    }
  }
  // If there weren't any rooms open, make a new one
  if (!added) {
    const roomName = `Room${rooms.length}`;
    socket.roomName = roomName;
    rooms[roomName] = new Room(roomName);
  }
};

// function to setup our socket server
const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;


  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    createLevel(socket);

    // create a unique id for the user based on the socket id and time
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    addUserToRoom(socket);

    socket.join(socket.roomName);

    const room = rooms[socket.roomName];

    // create a new character and store it by its unique id
    room.players[hash] = new Player(hash);

    // emit joined event to the user
    socket.emit('joined', room.players[hash]);

    physics.setRoomList(rooms);

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      // update the user's info
      // NOTICE: THIS IS NOT VALIDED AND IS UNSAFE
      room.players[socket.hash] = data;

      if (physics.checkMoveX(room.players[socket.hash], socket.roomName)) {
        // Player is colliding on x axis
        room.players[socket.hash].velocityX = 0;
      } else {
        // Player is not colliding on x axis
        const prevX = room.players[socket.hash].prevX;
        const velocityX = room.players[socket.hash].velocityX;

        room.players[socket.hash].destX = prevX + velocityX;
      }

      checkWaypoints(socket);


      // update timestamp of last change for this character
      room.players[socket.hash].lastUpdate = new Date().getTime();


      physics.setPlayer(room.players[socket.hash], socket.roomName);

      // Update other players with movement
      io.sockets.in(socket.roomName).emit('updateMovement', room.players[socket.hash]);
    });

    socket.on('updateLight', (data) => {
      room.players[socket.hash] = data;
      physics.setPlayer(room.players[socket.hash], socket.roomName);

      io.sockets.in(socket.roomName).emit('updateMovement', room.players[socket.hash]);
    });
    socket.on('jump', () => {
      physics.playerJump(room.players[socket.hash], socket.roomName);

      io.sockets.in(socket.roomName).emit('updateMovement', room.players[socket.hash]);
    });
    socket.on('respawn', () => {
      const wPoint = room.players[socket.hash].lastWaypoint;

      io.sockets.in(socket.roomName).emit('respawnPlayer', { hash: socket.hash, waypoint: wPoint });
    });

    socket.on('disconnect', () => {
      io.sockets.in(socket.roomName).emit('left', room.players[socket.hash]);

      delete room.players[socket.hash];
      room.numUsers--;

      physics.setPlayerList(room.players, socket.roomName);

      // if the room is now empty, delete it
      if (room.numUsers <= 0) {
        delete rooms[socket.roomName];
        physics.setRoomList(rooms);
      }


      socket.leave(socket.roomName);
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.updatePhysics = updatePhysics;
