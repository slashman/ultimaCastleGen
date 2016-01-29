var Random = require('./Random');
var Arrays = require('./Arrays');
var Cells = require('./Cells');

function RoomBuilder(){};

RoomBuilder.prototype = {
	buildRooms: function(map, rooms){
		this.map = map;
		for (var i = 0; i < rooms.length; i++){
			this.buildRoom(rooms[i]);
		}
	},
	buildRoom: function(room){
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				if (x == room.x || x == room.x + room.width - 1 || y == room.y || y == room.y + room.height - 1){
					this.map[x][y] = Cells.WALL;
				} else {
					this.map[x][y] = Cells.FLOOR;
				}
			}
		}
	},
	build_tower: function(room){
		for (var x = room.x; x < room.x + room.widthidth; x++){
			for (var y = room.y; y < room.y + room.heighteight; y++){
				var wall = false;
				if (x == room.x){
					wall = room.widthalls.west;
				} else if (x == room.x + room.width - 1){
					wall = room.widthalls.east;
				} else if (y == room.y){
					wall = room.widthalls.north;
				} else if (y == room.y + room.height - 1){
					wall = room.widthalls.south;
				}
				if (wall){
					if (wall === 'solid'){
						this.map[x][y] = Cells.WALL;
					} else if (wall === 'crossWindows'){
						if (x === room.x + Math.floor((room.x+room.width)/2) ||
							y === room.y + Math.floor((room.y+room.height)/2))
							this.map[x][y] = Cells.CROSS_WINDOW;
						else
							this.map[x][y] = Cells.WALL;
					} else if (wall === 'exit'){	
						if (x === room.x + Math.floor((room.x+room.width)/2) ||
							y === room.y + Math.floor((room.y+room.height)/2))
							this.map[x][y] = Cells.DOOR;
						else
							this.map[x][y] = Cells.WALL;
					} else if (wall === 'open'){
						this.map[x][y] = Cells.FLOOR;
					}
				} else {
					this.map[x][y] = Cells.FLOOR;
				}
			}
		}
	}
}

module.exports = RoomBuilder;