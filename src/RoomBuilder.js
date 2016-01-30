var Random = require('./Random');
var Arrays = require('./Arrays');
var Cells = require('./Cells');

function RoomBuilder(){};

RoomBuilder.prototype = {
	buildRooms: function(map, rooms){
		this.map = map;
		rooms = rooms.sort(function(a,b){var aLevel = a.level ? a.level : 0; var bLevel = b.level ? b.level : 0; return aLevel - bLevel;});
		for (var i = 0; i < rooms.length; i++){
			var buildFunction = this["build_"+rooms[i].type];
			if (buildFunction){
				buildFunction.call(this, rooms[i]);
			} else 
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
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				var wall = false;
				if (x == room.x){
					wall = room.features.walls.west;
				} else if (x == room.x + room.width - 1){
					wall = room.features.walls.east;
				} else if (y == room.y){
					wall = room.features.walls.north;
				} else if (y == room.y + room.height - 1){
					wall = room.features.walls.south;
				}
				if (wall){
					if (wall === 'solid'){
						this.map[x][y] = Cells.WALL;
					} else if (wall === 'crossWindows'){
						if (x === room.x + Math.floor(room.width/2)  ||
							y === room.y + Math.floor(room.height/2) )
							this.map[x][y] = Cells.CROSS_WINDOW;
						else
							this.map[x][y] = Cells.WALL;
					} else if (wall === 'exit'){	
						if (x === room.x + Math.floor(room.width/2) ||
							y === room.y + Math.floor(room.height/2) )
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
	},
	build_mainHall: function(room){
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				if (x == room.x || x == room.x + room.width - 1 || y == room.y || y == room.y + room.height - 1){
					this.map[x][y] = Cells.WALL;
				} else {
					this.map[x][y] = Cells.FLOOR_2;
				}
			}
		}
	},
	build_courtyard: function(room){
		/*
			centralFeature: 'fountain', // 'fountain' / 'well'
			additionalFountains: true, // only for 'fountain'
			fountainSymmetry: 'x', // Only for 'fountain' with additionalFountains ['x', 'y', 'full'];
			hasSmallLake: false // only for 'fountain'
			connectionWithRooms: {
				type: 'radial' // ['radial', 'around'],
				terrain: 'floor'  // ['floor', 'dirt'])
			},
		*/
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				if (x == room.x || x == room.x + room.width - 1 || y == room.y || y == room.y + room.height - 1){
					this.map[x][y] = Cells.WALL;
				} else {
					if (Random.chance(80))
						this.map[x][y] = Cells.GRASS_1;
					else if (Random.chance(80))
						this.map[x][y] = Cells.GRASS_2;
					else
						this.map[x][y] = Cells.TREE;
				}
			}
		}
		var midx = room.x+Math.floor(room.width/2);
		var midy = room.y+Math.floor(room.height/2);
		var connectionTerrain = room.features.connectionWithRooms.terrain;
		if (room.features.connectionWithRooms.type === 'radial'){
			for (var x = room.x; x < room.x + room.width; x++){
				this.map[x][midy-1] = connectionTerrain;
				this.map[x][midy] = connectionTerrain;
				this.map[x][midy+1] = connectionTerrain;
			}
			for (var y = room.y; y < room.y + room.height; y++){
				this.map[midx-1][y] = connectionTerrain;
				this.map[midx][y] = connectionTerrain;
				this.map[midx+1][y] = connectionTerrain;
			}
		} else if (room.features.connectionWithRooms.type === 'around'){

		}
		// connections
		if (room.features.centralFeature === 'fountain'){
			this.map[midx][midy] = Cells.FOUNTAIN;
		} else if (room.features.centralFeature === 'well'){
			this.map[midx][midy] = Cells.WELL;
		}
	}
}

module.exports = RoomBuilder;