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
		for (var i = 0; i < rooms.length; i++){
			this.placeDoors(rooms[i]);
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
	build_entranceHall: function(room){
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
		var halfClosing = Math.floor((room.width - room.features.closingWidth) / 2);
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
				} else if ((!room.features.isMain && y == room.y) || (room.features.isMain && y == room.y + room.height - 1) ){
					if (x >= room.x+halfClosing && x <= room.x + room.width - halfClosing-1){
						this.map[x][y] = Cells.FLOOR;
					} else {
						this.map[x][y] = Cells.WALL;
					}
				} else {
					this.map[x][y] = Cells.FLOOR;
				}
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
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				this.map[x][y] = Cells.FLOOR;
			}
		}
	},
	build_throneRoom: function(room){
		// Pad room
		if (room.width % 2 == 0){
			room.width--;
		}
		this.buildRoom(room);
		var midx = room.x+Math.floor(room.width/2);
		// Place throne
		this.map[midx][room.y+1] = Cells.THRONE;
		if (room.features.hasSecondaryThrone)
			this.map[midx-1][room.y+1] = Cells.SMALL_TABLE;
		if (room.features.hasMagicOrb)
			this.map[midx+1][room.y+1] = Cells.ORB;
		if (room.features.hasMagicCarpet)
			this.map[midx][room.y+2] = Cells.MAGIC_CARPET;

		var columnsPosition = Random.rand(2, Math.floor(room.width/2) - 2);
		var columnsSpacing = Random.rand(2,3);
		var torchesSpacing = Random.rand(2,3);
		var placeColumns = room.features.linedWithColumns && room.width >= 9;
		var placeTorches = room.features.linedWithTorches && room.width >= 9;
		var placeSmallCarpet = true;
		var placeBigCarpet = room.width >= 7;
		var carpetStart = room.features.hasMagicCarpet ? room.y + 3 : room.y + 2;

		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			// Place carpet
			if (room.features.hasCarpet) if (y >= carpetStart){
				if (placeSmallCarpet)
					this.map[midx][y] = Cells.FLOOR_2;
				if (placeBigCarpet){
					this.map[midx-1][y] = Cells.FLOOR_2;
					this.map[midx+1][y] = Cells.FLOOR_2;
				}
			}
			// Place columns	
			if (placeColumns) if (y % columnsSpacing == 0){
				this.map[room.x+columnsPosition][y] = Cells.COLUMN;
				this.map[room.x+room.width-columnsPosition-1][y] = Cells.COLUMN;
			}
			// Place torches
			if (placeTorches) if ((y+1) % torchesSpacing == 0){
				this.map[room.x+1][y] = Cells.L_TORCH;
				this.map[room.x+room.width-2][y] = Cells.R_TORCH;
			}
		}
		// Place door
		room.southDoors = [midx];
	},
	build_livingQuarters: function(room){
		this.buildRoom(room);
		var map = this.map;
		function placeBlock(x,y,size, flip){
			if (Random.chance(70))
				if (!flip){
					map[x][y] = Cells.BED_1;
					map[x+1][y] = Cells.BED_2;
					if (size > 2){
						map[x+2][y] = Cells.LOCKER;	
					}
				} else {
					if (size > 2){
						map[x+1][y] = Cells.BED_1;
						map[x+2][y] = Cells.BED_2;
						map[x][y] = Cells.LOCKER;	
					} else {
						map[x][y] = Cells.BED_1;
						map[x+1][y] = Cells.BED_2;
					}
				}
			
		}
		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			if (y%2 == 0){
				placeBlock(room.x+1, y, room.width >= 6 ? 3 : 2, false);
				if (room.width >= 8){
					var size = 2;
					if (room.width > 8){
						size = 3;
					}
					placeBlock(room.x+room.width-size-1, y, size, true);
				}
			} 
		}
		//TODO: Place teapot tables, plants, barrles, additional lockers, chairs+small table. Table instead of locker. Shelfs
	},
	placeDoors: function(room){
		if (room.northDoors) for (var i = 0; i < room.northDoors.length; i++){
			if (this.map[room.northDoors[i]][room.y-1] == Cells.WALL){
				this.map[room.northDoors[i]][room.y-1] = Cells.FLOOR;
				this.map[room.northDoors[i]][room.y] = Cells.FLOOR;
			} else {
				this.map[room.northDoors[i]][room.y] = Cells.DOOR;
			}
		}
		if (room.southDoors) for (var i = 0; i < room.southDoors.length; i++){
			if (this.map[room.southDoors[i]][room.y+room.height] == Cells.WALL){
				this.map[room.southDoors[i]][room.y+room.height] = Cells.FLOOR;
				this.map[room.southDoors[i]][room.y+room.height-1] = Cells.FLOOR;
			} else {
				this.map[room.southDoors[i]][room.y+room.height-1] = Cells.DOOR;
			}
		}

		if (room.westDoors) for (var i = 0; i < room.westDoors.length; i++){
			if (this.map[room.x-1][room.westDoors[i]] == Cells.WALL){
				this.map[room.x-1][room.westDoors[i]] = Cells.FLOOR;
				this.map[room.x][room.westDoors[i]] = Cells.FLOOR;
			} else {
				this.map[room.x][room.westDoors[i]] = Cells.DOOR;
			}
		}

		if (room.eastDoors) for (var i = 0; i < room.eastDoors.length; i++){
			if (this.map[room.x+room.width][room.eastDoors[i]] == Cells.WALL){
				this.map[room.x+room.width][room.eastDoors[i]] = Cells.FLOOR;
				this.map[room.x+room.width-1][room.eastDoors[i]] = Cells.FLOOR;
			} else {
				this.map[room.x+room.width-1][room.eastDoors[i]] = Cells.DOOR;
			}
		}
	}
}

module.exports = RoomBuilder;