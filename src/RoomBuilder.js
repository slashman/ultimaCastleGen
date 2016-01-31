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
					if (room.features.hasSpecialFloor)
						this.map[x][y] = Cells.FLOOR_2;
					else
						this.map[x][y] = Cells.FLOOR;
				}
			}
		}
		var midx = room.x+Math.floor(room.width/2);
		var midy = room.y+Math.floor(room.height/2);
		if (room.features.centralFireplace){
			if (room.features.centralFeature){
				if (room.width > 6 && room.height > 6){
					this.map[midx - 1][midy - 1] = Cells.FIREPLACE;
					this.map[midx + 1][midy - 1] = Cells.FIREPLACE;
					this.map[midx - 1][midy + 1] = Cells.FIREPLACE;
					this.map[midx + 1][midy + 1] = Cells.FIREPLACE;
				}
			} else {
				this.map[midx][midy] = Cells.FIREPLACE;
			}
		}
		if (room.features.cornerFireplaces && (room.height > 5 || room.width > 5)){
			if (!room.features.centralFireplace || (room.height > 7 || room.width > 7)){
				this.map[room.x+1][room.y+1] = Cells.FIREPLACE;
				this.map[room.x+1][room.y+room.height-2] = Cells.FIREPLACE;
				this.map[room.x+room.width-2][room.y+1] = Cells.FIREPLACE;
				this.map[room.x+room.width-2][room.y+room.height-2] = Cells.FIREPLACE;
			}
		}
		if (room.features.centralFeature === 'fountain'){
			this.map[midx][midy] = Cells.FOUNTAIN;
		}
		//TODO: Implement room.features.shape === 'circle'
		//TODO: Implement room.features.shape === 'cross'
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
			if (room.width > 6) for (var x = room.x + 1; x < room.x + room.width - 1; x++){
				this.map[x][midy-1] = connectionTerrain;
				this.map[x][midy] = connectionTerrain;
				this.map[x][midy+1] = connectionTerrain;
			}
			if (room.height > 6) for (var y = room.y + 1; y < room.y + room.height - 1; y++){
				this.map[midx-1][y] = connectionTerrain;
				this.map[midx][y] = connectionTerrain;
				this.map[midx+1][y] = connectionTerrain;
			}
			if (room.width > 7 && room.width > 7) {
				this.map[midx - 2][midy - 2] = connectionTerrain;
				this.map[midx - 2][midy + 2] = connectionTerrain;
				this.map[midx + 2][midy - 2] = connectionTerrain;
				this.map[midx + 2][midy + 2] = connectionTerrain;
			}
		} else if (room.features.connectionWithRooms.type === 'around'){
			for (var x = room.x + 1; x < room.x + room.width - 1; x++){
				this.map[x][room.y+1] = connectionTerrain;
				this.map[x][room.y+room.height - 2] = connectionTerrain;
			}
			for (var y = room.y + 1; y < room.y + room.height - 1; y++){
				this.map[room.x+1][y] = connectionTerrain;
				this.map[room.x+room.width - 2][y] = connectionTerrain;
			}
			if (room.width > 7 && room.height > 7){
				this.map[room.x+2][room.y+2] = connectionTerrain;
				this.map[room.x+2][room.y+room.height-3] = connectionTerrain;
				this.map[room.x+room.width-3][room.y+2] = connectionTerrain;
				this.map[room.x+room.width-3][room.y+room.height-3] = connectionTerrain;
			}
		}
		if (room.features.hasSmallLake  && room.height > 6 &&  room.width > 6){
			this.map[midx-1][midy] = Cells.WATER;
			this.map[midx][midy+1] = Cells.WATER;
			this.map[midx][midy] = Cells.WATER;
			this.map[midx][midy-1] = Cells.WATER;
			this.map[midx+1][midy] = Cells.WATER;

			if (Random.chance(60) && room.height > 7 && room.width > 7){
				this.map[midx-1][midy+1] = Cells.WATER;
				this.map[midx-1][midy-1] = Cells.WATER;
				this.map[midx+1][midy+1] = Cells.WATER;
				this.map[midx+1][midy-1] = Cells.WATER;
			}
		}
		if (room.features.centralFeature === 'fountain'){
			this.map[midx][midy] = Cells.FOUNTAIN;
		} else if (room.features.centralFeature === 'well'){
			this.map[midx][midy] = Cells.WELL;
		}
		if (room.features.additionalFountains){
			if (room.features.fountainSymmetry === 'x' && room.height > 9){
				this.map[midx][midy + 2] = Cells.FOUNTAIN;
				this.map[midx][midy - 2] = Cells.FOUNTAIN;
			} else if (room.features.fountainSymmetry === 'y' && room.width > 9){
				this.map[midx - 2][midy] = Cells.FOUNTAIN;
				this.map[midx + 2][midy] = Cells.FOUNTAIN;
			} else if (room.features.fountainSymmetry === 'full' && room.width > 9  && room.height > 9){
				this.map[midx - 2][midy - 2] = Cells.FOUNTAIN;
				this.map[midx + 2][midy - 2] = Cells.FOUNTAIN;
				this.map[midx - 2][midy + 2] = Cells.FOUNTAIN;
				this.map[midx + 2][midy + 2] = Cells.FOUNTAIN;
			}
		}
	},
	build_entrance: function(room){
		/*
		entranceStructure.hasFloor = Random.chance(50);
		entranceStructure.hasCrossWindows = Random.chance(50);
		entranceStructure.lighting = Random.randomElementOf(['none', 'torches', 'firepits']);
		entranceStructure.hasBanners = mainEntrance && Random.chance(60);
		entranceStructure.isMain = mainEntrance;
		entranceStructure.width = this.castle.central.width - Random.rand(3, 6) * 2;
		if (entranceStructure.width < 3)
			entranceStructure.width = 3;
		*/
		var halfOpening = Math.floor((room.width - room.features.openingWidth) / 2);
		console.log("halfOpening", halfOpening);
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				if (x == room.x || x == room.x + room.width - 1){
					this.map[x][y] = Cells.WALL;
				} else if ((room.features.isMain && y == room.y) || (!room.features.isMain && y == room.y + room.height - 1) ){
					if (x >= room.x+halfOpening && x <= room.x + room.width - halfOpening-1){
						this.map[x][y] = Cells.FLOOR;
					} else {
						this.map[x][y] = Cells.WALL;
					}
				} else {
					this.map[x][y] = Cells.FLOOR;
				}
			}
		}
	}
}

module.exports = RoomBuilder;