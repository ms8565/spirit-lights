'use strict';

class Room{
  constructor(name){
    this.name = name;
    this.numUsers = 1;
    this.players = {};
  }
}

module.exports = Room;