(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/administrator/git/ultimacastlegen/src/Arrays.js":[function(require,module,exports){
module.exports = {
    shuffle: function(array) {
        var counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            var index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            var temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    },
    removeObject: function(array, object){
        for(var i = 0; i < array.length; i++) {
            if(array[i] === object) {
               array.splice(i, 1);
            }
        }
    }
}
},{}],"/home/administrator/git/ultimacastlegen/src/CastleStructureGenerator.js":[function(require,module,exports){
var Random = require('./Random');

function CastleStructureGenerator(){};

CastleStructureGenerator.prototype = {
	generateMap: function(generationParams){
		this.generationParams = generationParams;
		var castle = {};
		this.castle = castle;
		castle.general = this.selectGeneral();
		castle.surroundings = this.selectSurroundings();
		castle.towers = this.selectTowers();
		castle.central = this.selectCentral();
		castle.entrances = this.selectEntrances();
		castle.rooms = this.selectRooms(castle);
		return castle;
	},
	selectGeneral: function(){
		return {
			size: Random.chance(80) ? 'big' : 'small',
			superSymmetric: Random.chance(20)
		}
	},
	selectSurroundings: function(){
		return {
			hasMoat: Random.chance(50)
		}
	},
	selectEntrances: function(){
		var entranceStructure = {};
		if (Random.chance(50)){
			entranceStructure.northExit = this.selectEntrance(false);
		}
		entranceStructure.southExit = this.selectEntrance(true);
		return entranceStructure;
	},
	selectEntrance: function(mainEntrance){
		var entranceStructure = {};
		entranceStructure.hasFloor = Random.chance(50);
		entranceStructure.hasCrossWindows = Random.chance(50);
		entranceStructure.lighting = Random.randomElementOf(['none', 'torches', 'firepits']);
		entranceStructure.hasBanners = mainEntrance && Random.chance(60);
		entranceStructure.isMain = mainEntrance;
		entranceStructure.width = this.castle.central.width - Random.rand(3, 6) * 2;
		if (entranceStructure.width < 3)
			entranceStructure.width = 3;
		entranceStructure.openingWidth = Random.rand(1,entranceStructure.width-2);
		if (entranceStructure.openingWidth % 2 == 0)
			entranceStructure.openingWidth--;
		entranceStructure.closingWidth = Random.rand(1,entranceStructure.width-2);
		if (entranceStructure.closingWidth % 2 == 0)
			entranceStructure.closingWidth--;
		return entranceStructure;
	},
	selectTowers: function(){
		var towerStructure = {};
		towerStructure.size = 5 + Random.rand(0,1) * 2;
		towerStructure.crossWindows = Random.chance(50);
		towerStructure.circle = Random.chance(50);

		towerStructure.verticalConnections = Random.chance(50);
		towerStructure.horizontalConnections = Random.randomElementOf(['both', 'top', 'bottom']);
		towerStructure.connectionCorridors = {};
		if (Random.chance(50)){
			towerStructure.connectionCorridors.type = 'corridor';
		} else {
			towerStructure.connectionCorridors.type = 'halls';
			towerStructure.connectionCorridors.hallDecoration = {
				torches: Random.chance(50),
				plants: Random.chance(50),
				columns: Random.chance(50),
				fountains: Random.chance(50)
			}
			towerStructure.connectionCorridors.hallWidth = Random.rand(3,5);
		}
		return towerStructure;
	},
	selectCentral: function(){
		var centralStructure = {};
		if (Random.chance(50)){
			centralStructure.type = 'courtyard';
			switch (Random.rand(0,2)){
			case 0:
				if (Random.chance(60))
					centralStructure.centralFeature = 'fountain';
				if (Random.chance(50)){
					centralStructure.additionalFountains = true;
					centralStructure.fountainSymmetry = Random.randomElementOf(['x', 'y', 'full']);
				}
				centralStructure.hasSmallLake = Random.chance(50);
				break;
			case 1:
				centralStructure.centralFeature = 'well';
				break;
			case 2:
				if (Random.chance(40))
					centralStructure.centralFeature = 'fountain';
				centralStructure.hasSmallLake = true;
				break;
			}
			centralStructure.connectionWithRooms = {
				type: Random.randomElementOf(['radial', 'around']),
				terrain: Random.randomElementOf(['floor', 'dirt'])
			};
		} else {
			centralStructure.type = 'mainHall';
			centralStructure.hasSpecialFloor = Random.chance(50);
			if (Random.chance(50)){
				centralStructure.centralFeature = 'fountain';
			}
			centralStructure.centralFireplace = Random.chance(50);
			centralStructure.cornerFireplaces = Random.chance(50);
		}
		centralStructure.width = 9 + Random.rand(0,3)*2;
		var maxWidth = 15;
		if (this.castle.towers.verticalConnections)
			maxWidth -= 8;
		if (this.castle.towers.connectionCorridors.hallWidth > 3)
			maxWidth -= 2;
		var maxHeight = 15;
		if (this.castle.towers.horizontalConnections === 'both')
			maxHeight -= 4;
		if (centralStructure.width > maxWidth)
			centralStructure.width = maxWidth;
		if (Random.chance(50)){
			centralStructure.height = 9 + Random.rand(0,3)*2;
			if (centralStructure.height > maxHeight)
				centralStructure.height = maxHeight;
		} else {
			centralStructure.height = centralStructure.width;
		}
		centralStructure.shape = Random.randomElementOf(['square', 'circle', 'cross']);
		return centralStructure;
	},
	selectRooms: function(castle){
		var numberOfRooms = 0;
		if (castle.general.size === 'small'){
			// Only four rooms, one below each "Tower"
			numberOfRooms = 4;
		} else {
			// Number of rooms depends on available space
			/**
			 * Base is 8 rooms
			 * -1 If North Exit
			 * +4 If no vertical connections between towers
			 * +2 If no top connection between towers
			 * +2 If no bottom connection between towers
			 * -4 If central feature is too big
			 */
			numberOfRooms = 8;
			if (castle.entrances.northExit)
				numberOfRooms--;
			if (castle.towers.verticalConnections)
			 	numberOfRooms+= 4;
			if (castle.towers.horizontalConnections != 'both')
			 	numberOfRooms+= 2;
			if (castle.central.width > 10)
			 	numberOfRooms-= 4;
			if (numberOfRooms < 0)
				numberOfRooms = 0;
		}
		var rooms = [];
		this.currentRooms = {};
		for (var i = 0; i < numberOfRooms; i++){
			var room = this.selectRoom(rooms);
			this.fillRoom(room);
			rooms.push(room);
		}
		return rooms;
	},
	fillRoom: function(room){
		switch (room.type){
			case 'livingQuarters':
				room.freeSpace = Random.rand(0, 50);
				break;
			case 'guestRoom':
				room.beds = Random.rand(1,2);
				room.mirror = Random.chance(50);
				room.piano = Random.chance(30);
				room.fireplace = Random.chance(50);
				break;
			case 'storage':
				room.filled = Random.rand(60,90);
				room.barrels = Random.rand(0,room.filled);
				room.boxes = room.filled - room.barrels;
				break;
			case 'diningRoom':
				room.luxury = Random.rand(1,3);
				room.fireplace = Random.chance(50);
				break;
			case 'kitchen':
				room.filled = Random.rand(0,20);
				room.barrels = Random.rand(0,room.filled);
				room.boxes = room.filled - room.barrels;
				room.hasOven = Random.chance(50);
				room.isNextTo = 'diningRoom';
				break;
			case 'throneRoom':
				room.hasCarpet = Random.chance(70);
				room.hasMagicCarpet = Random.chance(20);
				room.linedWithColumns = Random.chance(30);
				room.linedWithTorches = Random.chance(70);
				room.hasSecondaryThrone = Random.chance(50);
				room.hasMagicOrb = Random.chance(50);
				room.placeNorth = true;
				room.southRoom = 'throneHall';
				room.linkeable = false;
				room.isBig = true;
				room.level = 2;
				break;
			case 'lordQuarters':
				room.piano = Random.chance(50);
				room.clock = Random.chance(50);
				room.bookshelf = Random.chance(70);
				room.fireplace = Random.chance(80);
				room.placeNorth = true;
				room.isBig = true;
				break;
			case 'hall':
				room.torches = Random.chance(50);
				room.plants = Random.chance(50);
				room.columns = Random.chance(50);
				room.fountains = Random.chance(50);
				break;
		}
	},
	selectRoom: function(rooms){
		/**
		 * Throne Room - Required if the castle is Royal
		 * Castle Lord Room - Required
		 * Staff Living Quarters - At least one
		 * Dining rooms - At least one
		 * Kitchen - At least one
		 * Forge - Optional, only one
		 * Prison Cells - Optional
		 * Dungeon - Optional
		 * Hall - Optional
		 * Library - Optional
		 */
		var room = {};
		if (this.generationParams.royal && !this.currentRooms.throneRoom){
			room.type = 'throneRoom';
		} else if (!this.currentRooms.lordQuarters){
			room.type = 'lordQuarters';
		} else if (!this.currentRooms.diningRoom){
			room.type = 'diningRoom';
		} else if (!this.currentRooms.kitchen){
			room.type = 'kitchen';
		} else if (!this.currentRooms.livingQuarters){
			room.type = 'livingQuarters';
		} else {
			var possibleRooms = ['livingQuarters', 'diningRoom', 'kitchen', /*'prison', 'dungeon',*/ 'hall', 'guestRoom', 'library'];
			/*if (!this.currentRooms.forge){
				possibleRooms.push('forge');
			}*/
			room.type = Random.randomElementOf(possibleRooms);
		}
		this.currentRooms[room.type] = true;
		return room;
	}
}

module.exports = CastleStructureGenerator;
},{"./Random":"/home/administrator/git/ultimacastlegen/src/Random.js"}],"/home/administrator/git/ultimacastlegen/src/Cells.js":[function(require,module,exports){
module.exports = {
	WALL: 'wall',
	FLOOR: 'floor',
	FLOOR_2: 'floor2',
	GRASS_1: 'grass1',
	GRASS_2: 'grass2',
	TREE: 'tree',
	DOOR: 'door',
	CROSS_WINDOW: 'crossWindow',
	FOUNTAIN: 'fountain',
	WATER: 'water',
	WELL: 'well',
	DIRT: 'dirt',
	FIREPLACE: 'fireplace',
	COLUMN: 'column',
	R_TORCH: 'rTorch',
	L_TORCH: 'lTorch',
	THRONE: 'throne',
	ORB: 'orb',
	SMALL_TABLE: 'smallTable',
	MAGIC_CARPET: 'magicCarpet',
	BED_1: 'bed1',
	BED_2: 'bed2',
	LOCKER: 'locker',
	JAR_TABLE: 'jarTable',
	BARREL: 'barrel',
	PLANT: 'plant',
	MIRROR: 'mirror',
	SHELF: 'shelf',
	PIANO: 'piano',
	R_CHAIR: 'rChair',
	L_CHAIR: 'lChair',
	S_CHAIR: 'sChair',
	N_CHAIR: 'nChair',
	S_PIANO: 'sPiano',
	CLOCK: 'clock',
	SHELF_2: 'shelf2',
	R_TABLE: 'rTable',
	L_TABLE: 'lTable',
	C_TABLE_1: 'cTable1',
	C_TABLE_2: 'cTable2',
	C_TABLE_3: 'cTable3',
	C_TABLE_4: 'cTable4',
	WALL_FIREPLACE: 'firewall',
	GRILL: 'grill',
	OVEN: 'oven',
	WINE_BARREL: 'wineBarrel',
	LIBRARY_1: 'library1',
	LIBRARY_2: 'library2',
	CHEST: 'chest'
};
},{}],"/home/administrator/git/ultimacastlegen/src/MapGenerator.js":[function(require,module,exports){
var CastleStructureGenerator = require('./CastleStructureGenerator');
var RoomsGenerator = require('./RoomsGenerator');
var RoomBuilder = require('./RoomBuilder');
var TerrainGenerator = require('./TerrainGenerator');

function MapGenerator(){

};

MapGenerator.prototype = {
	generateMap: function(generationParams){
		this.generationParams = generationParams;
		this.castleStructureGenerator = new CastleStructureGenerator();
		this.roomsGenerator = new RoomsGenerator();
		this.terrainGenerator = new TerrainGenerator();
		this.roomBuilder = new RoomBuilder();
		
		var castle = {};
		while (true){
			castle.structure = this.castleStructureGenerator.generateMap(generationParams);
			castle.rooms = this.roomsGenerator.generateMap(castle.structure, generationParams);
			if (castle.rooms != false)
				break;
		}

		castle.map = this.terrainGenerator.generateTerrain(generationParams);
		this.roomBuilder.buildRooms(castle.map, castle.rooms);
		return castle;
	}
}

module.exports = MapGenerator;
},{"./CastleStructureGenerator":"/home/administrator/git/ultimacastlegen/src/CastleStructureGenerator.js","./RoomBuilder":"/home/administrator/git/ultimacastlegen/src/RoomBuilder.js","./RoomsGenerator":"/home/administrator/git/ultimacastlegen/src/RoomsGenerator.js","./TerrainGenerator":"/home/administrator/git/ultimacastlegen/src/TerrainGenerator.js"}],"/home/administrator/git/ultimacastlegen/src/Random.js":[function(require,module,exports){
module.exports = {
	rand: function(low, hi){
		return Math.floor(Math.random() * (hi - low + 1))+low;
	},
	randomElementOf: function(array){
    	return array[Math.floor(Math.random()*array.length)];
    },
    chance: function(chance){
		return this.rand(0,100) <= chance;
	}
}
},{}],"/home/administrator/git/ultimacastlegen/src/RoomBuilder.js":[function(require,module,exports){
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
	build_rooms: function(room){ // Foundations
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				if (x == room.x || x == room.x + room.width - 1 || y == room.y || y == room.y + room.height - 1){
					this.map[x][y] = Cells.WALL;
				} else {
					this.map[x][y] = Random.chance(80) ? Cells.FLOOR : Cells.CHEST;
				}
			}
		}
	},
	build_tower: function(room){
		if (room.features.walls.north == 'exit')
			room.northDoors = [{position: room.x + Math.floor(room.width/2), cell: Cells.DOOR}];
		if (room.features.walls.south == 'exit')
			room.southDoors = [{position: room.x + Math.floor(room.width/2), cell: Cells.DOOR}];
		if (room.features.walls.east == 'exit')
			room.eastDoors = [{position: room.y + Math.floor(room.height/2), cell: Cells.DOOR}];
		if (room.features.walls.west == 'exit')
			room.westDoors = [{position: room.y + Math.floor(room.height/2), cell: Cells.DOOR}];

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
		for (var x = room.x; x < room.x + room.width; x++){
			for (var y = room.y; y < room.y + room.height; y++){
				this.map[x][y] = Cells.FLOOR;
			}
		}
	},
	build_throneRoom: function(room){
		// Pad room
		var modifiedWidth = false;
		if (room.width % 2 == 0){
			room.width--;
			for (var y = room.y; y < room.y + room.height; y++){
				this.map[room.x+room.width-1][y] = Cells.WALL;
			}
			modifiedWidth = true;
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
		room.southDoors = [{position: midx, cell: Cells.DOOR}];
		if (modifiedWidth){
			room.width++;
		}
	},
	build_livingQuarters: function(room){
		this.buildLivingQuarters(room, 'simple');
	},
	build_guestRoom: function(room){
		this.buildLivingQuarters(room, 'guestRoom');
	},
	build_lordQuarters: function(room){
		this.buildLivingQuarters(room, 'lord');
	},
	buildLivingQuarters: function(room, quartersType){
		this.buildRoom(room);
		var leftSize = room.width >= 6 ? 3 : 2;
		var rightSize = room.width >= 8 ? room.width > 8 ? 3 : 2 : 0;
		var topSize = room.height >= 6 ? 3 : 2;
		var bottomSize = room.height >= 8 ? room.height > 8 ? 3 : 2 : 0;

		if (Random.chance(50)){
			// Flip sides
			var temp = rightSize;
			rightSize = leftSize;
			leftSize = temp;
		} 
		room.placedElements = {};
		// Place furniture
		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			if (leftSize){
				var mainBlock = this.selectLivingQuartersBlock(room, y, quartersType);
				if (mainBlock) 
					this.placeBlock(mainBlock, room.x+1, y, leftSize, false, quartersType);
			}
			if (rightSize){
				var mainBlock = this.selectLivingQuartersBlock(room, y, quartersType);
				if (mainBlock) 
					this.placeBlock(mainBlock, room.x+room.width-rightSize-1, y, rightSize, true, quartersType);
			}
		}
		for (var x = room.x+3; x < room.x + room.width - 3; x++){
			if (topSize){
				var mainBlock = this.selectLivingQuartersVBlock(room, quartersType);
				if (mainBlock) 
					this.placeVBlock(mainBlock, x, room.y+1, topSize, false, quartersType);
			}
			if (bottomSize){
				var mainBlock = this.selectLivingQuartersVBlock(room, quartersType);
				if (mainBlock) 
					this.placeVBlock(mainBlock, x, room.y+room.height-bottomSize-1, bottomSize, true, quartersType);
			}
		}

		if (quartersType === 'lord' || quartersType === 'guestRoom'){
			// Place bed(s) for royal and guest quarters
			var numberOfBeds = quartersType === 'guestRoom' ? 2 : 1;
			for (var i = 0; i < numberOfBeds; i++){
				var y = Random.rand(room.y+1, room.y + room.height - 2 - (quartersType === 'lord' ? 1 : 0));
				if (leftSize){
					this.placeBlock('bed', room.x+1, y, leftSize, false, quartersType);
				} else if (rightSize){
					this.placeBlock('bed', room.x+room.width-rightSize-1, y, rightSize, true, quartersType);
				}
			}
			this.addWallFireplace(room);
		}
		this.addTorchesToRoom(room);
		
	},
	selectLivingQuartersBlock: function(room, y, quartersType){
		// Beds?
		if (quartersType === 'simple' && ((y%2 == 0 && Random.chance(70)) || (y%2 != 0 && Random.chance(30)))){
			return 'bed';
		}
		// Nothing?
		if (Random.chance(20)){
			return false;
		}
		// Table with chair
		if (!room.placedElements["tableAndChair"] && (quartersType === 'lord' || quartersType === 'guestRoom') && Random.chance(40)){
			room.placedElements["tableAndChair"] = true;
			return 'tableAndChair'
		}
		// Kitchen Table
		if (!room.placedElements["diningTable"] && quartersType === 'kitchen' && y > room.y+1 && y < room.y+room.height - 2 && Random.chance(40)){
			room.placedElements["diningTable"] = true;
			return 'diningTable'
		}
		var additionalElements = false;
		switch (quartersType){
			case 'simple':
				additionalElements = [Cells.BARREL, Cells.LOCKER, Cells.PLANT, Cells.SMALL_TABLE];
				break;
			case 'guestRoom':
				additionalElements = [Cells.BARREL, Cells.SHELF, Cells.PLANT, Cells.JAR_TABLE];
				break;
			case 'lord':
				additionalElements = [Cells.SHELF, Cells.PLANT, Cells.JAR_TABLE];
				break;
			case 'kitchen':
				additionalElements = [Cells.WINE_BARREL, Cells.OVEN,  Cells.BARREL, Cells.GRILL, 'tableAndChair'];
				break;
			case 'library':
				additionalElements = ['bookshelf', 'tableAndChair', Cells.PLANT, Cells.SHELF_2];
				break;
			case 'hall':
				additionalElements = [Cells.PLANT];
				if (!room.placedElements[Cells.FOUNTAIN])
					additionalElements.push(Cells.FOUNTAIN);
				break;

		}
		var element = Random.randomElementOf(additionalElements);
		room.placedElements[element] = true;
		return element;
	},
	selectLivingQuartersVBlock: function(room, quartersType){
		if (!room.placedElements["tableAndPiano"] && quartersType === 'lord' && Random.chance(40)){
			room.placedElements["tableAndPiano"] = true;
			return 'tableAndPiano'
		}
		if (Random.chance(60)){
			return false;
		}
		var additionalElements = false;
		switch (quartersType){
			case 'simple':
				additionalElements = [Cells.BARREL, Cells.LOCKER, Cells.PLANT, Cells.SMALL_TABLE];
				break;
			case 'guestRoom':
				additionalElements = [Cells.BARREL, Cells.SHELF, Cells.SHELF_2, Cells.PLANT, Cells.JAR_TABLE];
				if (!room.placedElements[Cells.MIRROR])
					additionalElements.push(Cells.MIRROR);
				break;
			case 'lord':
				additionalElements = [Cells.SHELF, Cells.SHELF_2,  Cells.PLANT, Cells.JAR_TABLE];
				if (!room.placedElements[Cells.MIRROR])
					additionalElements.push(Cells.MIRROR);
				if (!room.placedElements[Cells.CLOCK])
					additionalElements.push(Cells.CLOCK);
				break;
			case 'kitchen':
				additionalElements = [Cells.WINE_BARREL, Cells.OVEN,  Cells.BARREL, Cells.GRILL];
				break;
			case 'library':
				additionalElements = [Cells.PLANT, Cells.SHELF_2];
				if (!room.placedElements[Cells.CLOCK])
					additionalElements.push(Cells.CLOCK);
				break;
			case 'hall':
				additionalElements = [Cells.PLANT];
				if (!room.placedElements[Cells.FOUNTAIN])
					additionalElements.push(Cells.FOUNTAIN);
				break;

		}
		var element = Random.randomElementOf(additionalElements);
		room.placedElements[element] = true;
		return element;
	},
	placeVBlock: function(type, x,y,size, flip, quartersType){
		switch (type){
		case 'tableAndChair':
			if (!flip){
				this.map[x][y] = Cells.SMALL_TABLE;
				this.map[x][y+1] = Cells.N_CHAIR;
			} else {
				this.map[x][y+size-1] = Cells.SMALL_TABLE;
				this.map[x][y+size-2] = Cells.S_CHAIR;
			}
			break;
		case 'tableAndPiano':
			if (!flip){
				this.map[x][y] = Cells.S_PIANO;
				this.map[x][y+1] = Cells.N_CHAIR;
			} else {
				this.map[x][y+size-1] = Cells.PIANO;
				this.map[x][y+size-2] = Cells.S_CHAIR;
			}
			break;
		default:
			var y = flip ? y+size-1 : y;
			this.map[x][y] = type;
			break;
		}
	},
	placeBlock: function(type, x,y,size, flip, quartersType){
		switch (type){
		case 'bed':
			if (!flip){
				this.map[x][y] = Cells.BED_1;
				this.map[x+1][y] = Cells.BED_2;
				if (size > 2 && quartersType === 'simple'){
					this.map[x+2][y] = Random.chance(70) ? Cells.LOCKER : Cells.SMALL_TABLE;	
				}
			} else {
				if (size > 2){
					this.map[x+1][y] = Cells.BED_1;
					this.map[x+2][y] = Cells.BED_2;
					if (quartersType === 'simple')
						this.map[x][y] = Random.chance(70) ? Cells.LOCKER : Cells.SMALL_TABLE;	
				} else {
					this.map[x][y] = Cells.BED_1;
					this.map[x+1][y] = Cells.BED_2;
				}
			}
			break;
		case 'tableAndChair':
			if (!flip){
				this.map[x][y] = Cells.SMALL_TABLE;
				this.map[x+1][y] = Cells.L_CHAIR;
			} else {
				this.map[x+size-1][y] = Cells.SMALL_TABLE;
				this.map[x+size-2][y] = Cells.R_CHAIR;
			}
			break;
		case 'tableAndPiano':
			var x = flip ? x+size-1 : x;
			if (this.map[x][y-1] !== Cells.BED_2 && this.map[x][y-1] !== Cells.BED_2){
				this.map[x][y-1] = Cells.S_CHAIR;
				this.map[x][y] = Cells.PIANO;
			}
			break;
		case 'diningTable':
			if (size == 1){
				this.map[x][y] = Cells.SMALL_TABLE;
			} else {
				this.map[x][y] = Cells.L_TABLE;
				this.map[x+size-1][y] = Cells.R_TABLE;
				for (var i = 0; i < size-2; i++){
					switch (Random.rand(0,3)){
						case 0: this.map[x+1+i][y] = Cells.C_TABLE_1; break;
						case 1: this.map[x+1+i][y] = Cells.C_TABLE_2; break;
						case 2: this.map[x+1+i][y] = Cells.C_TABLE_3; break;
						case 3: this.map[x+1+i][y] = Cells.C_TABLE_4; break;
					}
				}
			}
			break;
		case 'bookshelf':
			if (flip){
				this.map[x+size-2][y] = Cells.LIBRARY_1;
				this.map[x+size-1][y] = Cells.LIBRARY_2;	
			} else {
				this.map[x][y] = Cells.LIBRARY_1;
				this.map[x+1][y] = Cells.LIBRARY_2;	
			}
			break;
		case 'upChairs':
			if (size === 1){
				this.map[x][y] = Cells.N_CHAIR;
			} else for (var i = x; i < x+size-1; i++){
				if (Random.chance(80)) this.map[i][y] = Cells.N_CHAIR;
			}
		break;
		case 'downChairs':
			if (size === 1){
				this.map[x][y] = Cells.S_CHAIR;
			} else for (var i = x+1; i < x+size; i++){
				if (Random.chance(80)) this.map[i][y] = Cells.S_CHAIR;
			}
		break;
		default:
			var x = flip ? x+size-1 : x;
			this.map[x][y] = type;
			break;
		}
	},
	placeDoors: function(room){
		if (room.northDoors) for (var i = 0; i < room.northDoors.length; i++){
			var door = room.northDoors[i];
			if (door.cell === Cells.DOOR){
				this.tryClear(door.position,room.y-1)
				this.tryClear(door.position,room.y+1)
			}
			if (this.map[door.position][room.y] === Cells.WALL)
				this.map[door.position][room.y] = door.cell;
		}
		if (room.southDoors) for (var i = 0; i < room.southDoors.length; i++){
			var door = room.southDoors[i];
			if (door.cell === Cells.DOOR){
				this.tryClear(door.position,room.y+room.height);
				this.tryClear(door.position,room.y+room.height-2);
			}
			if (this.map[door.position][room.y+room.height-1] === Cells.WALL)
				this.map[door.position][room.y+room.height-1] = door.cell;
		}
		if (room.westDoors) for (var i = 0; i < room.westDoors.length; i++){
			var door = room.westDoors[i];
			if (door.cell === Cells.DOOR){
				this.tryClear(room.x-1,door.position);
				this.tryClear(room.x+1,door.position);
			}
			if (this.map[room.x][door.position] === Cells.WALL)
				this.map[room.x][door.position] = door.cell;
		}

		if (room.eastDoors) for (var i = 0; i < room.eastDoors.length; i++){
			var door = room.eastDoors[i];
			if (door.cell === Cells.DOOR){
				this.tryClear(room.x+room.width,door.position);
				this.tryClear(room.x+room.width-2,door.position);
			}
			if (this.map[room.x+room.width-1][door.position] === Cells.WALL)
				this.map[room.x+room.width-1][door.position] = door.cell;
		}
	},
	tryClear: function(x,y){
		if (!this.isFloor(x,y)){
			if (this.map[x][y] === Cells.BED_2)
				this.map[x-1][y] = Cells.FLOOR;
			if (this.map[x][y] === Cells.BED_1)
				this.map[x+1][y] = Cells.FLOOR;
			if (this.map[x][y] === Cells.LIBRARY_2)
				this.map[x-1][y] = Cells.FLOOR;
			if (this.map[x][y] === Cells.LIBRARY_1)
				this.map[x+1][y] = Cells.FLOOR;	
			if (this.map[x][y] === Cells.R_TABLE){
				if (this.map[x-1][y] === Cells.L_TABLE){
					this.map[x-1][y] = Cells.SMALL_TABLE;
				} else {
					this.map[x-1][y] = Cells.R_TABLE;
				}
			} else if (this.map[x][y] === Cells.L_TABLE){
				if (this.map[x+1][y] === Cells.R_TABLE){
					this.map[x+1][y] = Cells.SMALL_TABLE;
				} else {
					this.map[x+1][y] = Cells.L_TABLE;
				}
			}
			this.map[x][y] = Cells.FLOOR;
		}
	},
	isFloor: function(x,y){
		return this.map[x][y] === Cells.FLOOR || 
			this.map[x][y] === Cells.FLOOR_2 || 
			this.map[x][y] === Cells.DIRT ||
			this.map[x][y] === Cells.GRASS_1 ||
			this.map[x][y] === Cells.GRASS_2; 
	},
	isMultiTile: function(x,y){
		return this.map[x][y] === Cells.L_TABLE || 
			this.map[x][y] === Cells.R_TABLE || 
			this.map[x][y] === Cells.C_TABLE_1 || 
			this.map[x][y] === Cells.C_TABLE_2 || 
			this.map[x][y] === Cells.C_TABLE_3 || 
			this.map[x][y] === Cells.C_TABLE_4 || 
			this.map[x][y] === Cells.LIBRARY_1 || 
			this.map[x][y] === Cells.LIBRARY_2 ||
			this.map[x][y] === Cells.BED_1 ||
			this.map[x][y] === Cells.BED_2; 
	},
	build_diningRoom: function(room){
		var tableLength = room.width - 3;
		this.buildRoom(room);
		var leftSize = Random.chance(50);
		room.placedElements = {};
		var location = Random.rand(room.x+1, room.x+room.width-tableLength-1);
		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			var phase = (y-room.y)%3;
			if (phase == 1){
				if ((room.y+room.height)-y<4)
					break;
				location = Random.rand(room.x+1, room.x+room.width-tableLength-1);
			}
			// Place tables and chairs
			switch(phase){
				case 0:
					this.placeBlock('upChairs', location, y, tableLength, false, 'diningRoom');
					break;
				case 1:
					this.placeBlock('downChairs', location, y, tableLength, false, 'diningRoom');
					break;
				case 2:
					this.placeBlock('diningTable', location, y, tableLength, false, 'diningRoom');
					break;
			}
		}
		this.addWallFireplace(room);
		this.addTorchesToRoom(room);
	},
	addTorchesToRoom: function(room){
		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			if (Random.chance(30) && !this.isMultiTile(room.x+1, y)){
				this.map[room.x+1][y] = Cells.L_TORCH;
				y++;
			}
		}
		for (var y = room.y+1; y < room.y + room.height - 1; y++){
			if (Random.chance(30) && !this.isMultiTile(room.x+room.width-2, y)){
				this.map[room.x+room.width-2][y] = Cells.R_TORCH;
				y++;
			}
		}
	},
	addWallFireplace: function(room){
		var wall = room.northDoors;
		if (!wall) {
			wall = [];
			room.northDoors = wall;
		}
		wall.push({cell: Cells.WALL_FIREPLACE, position: Random.rand(room.x+1, room.x+room.width - 2)});
	},
	build_kitchen: function(room){
		this.buildLivingQuarters(room, 'kitchen');
	},
	build_library: function(room){
		this.buildLivingQuarters(room, 'library');
	},
	build_throneHall: function(room){
		this.build_hall(room);
	},
	build_halls: function(room){ // Wall halls}
		this.buildRoom(room);
		if (room.width > 3)
			this.addTorchesToRoom(room);
	},
	build_hall: function(room){
		this.buildLivingQuarters(room, 'hall');
	}
}

module.exports = RoomBuilder;
},{"./Arrays":"/home/administrator/git/ultimacastlegen/src/Arrays.js","./Cells":"/home/administrator/git/ultimacastlegen/src/Cells.js","./Random":"/home/administrator/git/ultimacastlegen/src/Random.js"}],"/home/administrator/git/ultimacastlegen/src/RoomsGenerator.js":[function(require,module,exports){
var Random = require('./Random');
var Arrays = require('./Arrays');
var Cells = require('./Cells');

function RoomsGenerator(){};

RoomsGenerator.prototype = {
	generateMap: function(structure, generationParams){
		this.structure = structure;
		this.generationParams = generationParams;
		this.rooms = [];
		this.anchorPoints = {};
		this.placeFoundations();
		this.placeTowers();
		this.placeCentralFeature();
		this.placeEntrances();
		var retries = 0;
		while(true){
			var emptyRooms = this.placeRooms();
			if (emptyRooms == false){
				return false;
			}
			var assigned = this.assignRooms(emptyRooms);
			if (!assigned){
				if (retries++ < 50){
					continue;
				} else {
					return false;
				}
			}
			break;
		}
		this.linkRooms();
		return this.rooms;
	},
	placeFoundations: function(){
		var def = this.structure.towers;
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		var x = 3;
		if (def.verticalConnections){
			x = 1 + Math.floor(def.size / 2) + Math.floor(connectionWidth/2) - 1;
		}
		var y = 3;
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'top'){
			y = 1 + Math.floor(def.size / 2) + Math.floor(connectionWidth/2);
		}
		var yEnd = this.generationParams.height - 5;
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom'){
			yEnd = this.generationParams.height - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2);
		}
		this.addRoom(
			x,
			y,
			'rooms',
			'',
			this.generationParams.width -  2 * x - 1,
			yEnd - y + 1,
			{},
			-2
		);
	},

	placeTowers: function(){
		var def = this.structure.towers;
		//NW
		this.addRoom(1, 1,'tower', 'Northwest Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				north: def.crossWindows ? 'crossWindows' : 'solid',
				west: def.crossWindows ? 'crossWindows' : 'solid',
				south: def.verticalConnections ? 'exit' : 'solid',
				east: def.horizontalConnections === 'both' || def.horizontalConnections === 'top' ? 'exit' : 'solid'
			}
		}, -1);
		//NE
		this.addRoom(this.generationParams.width - def.size - 2, 1,'tower', 'Northeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				north: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				south: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'top' ? 'exit' : 'solid'
			}
		}, -1);
		//SW
		this.addRoom(1, this.generationParams.height - def.size - 2,'tower', 'Southwest Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				west: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				east: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		}, -1);
		//SE
		this.addRoom(this.generationParams.width - def.size - 2, this.generationParams.height - def.size - 2,'tower', 'Southeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		}, -1);
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		if (def.verticalConnections){
			// West corridor
			this.addRoom(
				1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2), 
				1 + def.size - 1, 
				def.connectionCorridors.type, 'West '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 1,
				def.hallDecoration,
				0,
				true
			);
			// East corridor
			this.addRoom(
				this.generationParams.width - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2) + ((def.size - connectionWidth)%2 != 0 ? 1 : 0), 
				1 + def.size - 1, 
				def.connectionCorridors.type, 'East '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 1,
				def.hallDecoration,
				0,
				true
			);
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'top'){
			// North corridor
			this.anchorPoints.northBound = 1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2);
			this.addRoom(
				1 + def.size - 1, 
				this.anchorPoints.northBound, 
				def.connectionCorridors.type, 'North '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 1,
				connectionWidth, 
				def.hallDecoration,
				0,
				true
			);
		} else {
			this.anchorPoints.northBound = 3;
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom'){
			this.anchorPoints.southBound = this.generationParams.height - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2)+ ((def.size - connectionWidth)%2 != 0 ? 1 : 0) + connectionWidth;
			// South corridor
			this.addRoom(
				1 + def.size - 1, 
				this.anchorPoints.southBound - connectionWidth,
				def.connectionCorridors.type, 'South '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 1,
				connectionWidth, 
				def.hallDecoration,
				0,
				true
			);
		} else {
			this.anchorPoints.southBound = this.generationParams.height - 4;
		}
	},
	placeCentralFeature: function(){
		var def = this.structure.central;
		this.centerRoom = this.addRoom(
			Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
			Math.floor(this.generationParams.height / 2) - Math.floor(def.height /2) - 1,
			def.type,
			def.type === 'courtyard' ? 'Courtyard' : 'Main Hall',
			def.width,
			def.height,
			def
		);
	},
	placeEntrances: function(){
		var entranceLength = Math.floor(this.generationParams.height / 2) - Math.floor(this.structure.central.height /2) - 1;

		// North entrance
		if (this.structure.entrances.northExit){
			var def = this.structure.entrances.northExit;
			// Northern Exit
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				0,
				'entrance',
				'Entrance',
				def.width,
				this.anchorPoints.northBound,
				def,
				1,
				false
			);

			// Northern entrance hall
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				this.anchorPoints.northBound,
				'entranceHall',
				'Entrance Hall',
				def.width,
				entranceLength - this.anchorPoints.northBound + 1,
				def,
				1,
				false
			);
		}
		// South Entrance
		if (this.structure.entrances.southExit){
			var def = this.structure.entrances.southExit;
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				entranceLength + this.structure.central.height - 1,
				'entranceHall',
				'Entrance Hall',
				def.width,
				this.anchorPoints.southBound - (entranceLength + this.structure.central.height - 1),
				def,
				1,
				false
			);
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				this.anchorPoints.southBound,
				'entrance',
				'Entrance',
				def.width,
				this.generationParams.height - this.anchorPoints.southBound,
				def,
				1,
				false
			);
		}

	},
	placeRooms: function(){
		var def = this.structure.towers;
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		var x = 3;
		var adjustment = (def.size - connectionWidth)%2 == 0 ? 1 : 0;
		adjustment = 0;
		if (def.verticalConnections){
			x = 1 + Math.floor(def.size / 2) + Math.floor(connectionWidth/2) + adjustment - 1;
		}
		var y = 3;
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'top'){
			y = 1 + Math.floor(def.size / 2) + Math.floor(connectionWidth/2) + adjustment;
		}
		var yEnd = this.generationParams.height - 5;
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom'){
			yEnd = this.generationParams.height - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2) - adjustment;
		}
		var area = {
			x: x,
			y: y,
			w: Math.floor(this.generationParams.width / 2) - x,
			h: yEnd - y + 1
		};
		// Brute force! Let's try a lot of times to fit the rooms in the space we have!
		var roomsToPlace = Math.ceil(this.structure.rooms.length / 2);
		this.roomsArea = area;
		var minHeight = 5;
		var maxHeight = 7;
		var minWidth = 5;
		var maxWidth = 7;
		var addedRooms = [];
		var placedRooms = 0;
		var reduceRoomsToPlace = 100;
		// Place room connecting with courtyard
		addedRooms.push({
			x: this.centerRoom.x - 4,
			y: this.centerRoom.y + Math.floor(this.centerRoom.height/2) - 2,
			w: 5,
			h: 5
		});
		out: for (var i = 0; i < 500; i++){
			for (var j = 0; j < 500; j++){
				var room = {
					x: Random.rand(area.x, area.x + area.w - 2 - minWidth),
					y: Random.rand(area.y, area.y + area.h - 2 - minHeight),
					w: Random.rand(minWidth, maxWidth),
					h: Random.rand(minHeight, maxHeight),
				};
				if (this.validRoom(room, addedRooms)){
					addedRooms.push(room);
					placedRooms++;
					if (placedRooms == roomsToPlace)
						break out;
				}
			}
			if (reduceRoomsToPlace == 0){
				if (roomsToPlace > 4)
					roomsToPlace--;
				reduceRoomsToPlace = 100;
			} else {
				reduceRoomsToPlace --; 
			}
			addedRooms = [];
		}
		if (placedRooms != roomsToPlace)
			return false; // Couldn't place enough rooms, sucks!
		
		// Is the castle super symmetric? if not, we mirror the rooms before making them grow, and extend the play area
		if (!this.structure.general.superSymmetric){
			var originalRoomsCount = addedRooms.length;
			// Mirror the added rooms over the y axis
			for (var i = 0; i < originalRoomsCount; i++){
				var room = addedRooms[i];
				var dist = this.roomsArea.x + this.roomsArea.w - (room.x + room.w);
				addedRooms.push({
					x: this.roomsArea.x + this.roomsArea.w + dist - 1,
					y: room.y,
					w: room.w,
					h: room.h
				});
			}
			area.w = this.generationParams.width - 2 * x - 1;
		}

		while(true){
			//Try to make each room bigger in a direction, until it's not possible for any
			var grew = false;
			for (var i = 0; i < addedRooms.length; i++){
				var room = addedRooms[i];
				//Select a random direction first, if it can't grow in that direction, check in order
				var randomDirection = Random.rand(0,3);
				if (this.roomCanGrow(room, addedRooms, randomDirection)){
					this.growRoom(room, randomDirection);
					grew = true;
				} else {
					for (var j = 0; j <= 3; j++){
						if (this.roomCanGrow(room, addedRooms, j)){
							this.growRoom(room, j);
							grew = true;
							break;
						}
					}
				}
			}
			if (!grew){
				break;
			}
		}
		
		// If the castle is super symmetric, mirror them now (after growing)
		if (this.structure.general.superSymmetric){
			var originalRoomsCount = addedRooms.length;
			// Mirror the added rooms over the y axis
			for (var i = 0; i < originalRoomsCount; i++){
				var room = addedRooms[i];
				var dist = this.roomsArea.x + this.roomsArea.w - (room.x + room.w);
				addedRooms.push({
					x: this.roomsArea.x + this.roomsArea.w + dist - 1,
					y: room.y,
					w: room.w,
					h: room.h
				});
			}
		}

		// Now let's fill the spaces and make these rooms grow again
		area.w = this.generationParams.width - 2 * x - 1;
		while(true){
			var noHoles = true;
			hole: for (var x = area.x; x <= area.x + area.w - 2; x++){
				for (var y = area.y; y <= area.y + area.h - 2; y++){
					// Is there a hole here? is it big enough?
					if (this.holeAt(addedRooms, x,y)){
						noHoles = false;
						// Lets plot a room and make it grow
						var fillRoom = {
							x: x,
							y: y,
							w: 5,
							h: 5
						};
						console.log("Placing a fill room", fillRoom);
						addedRooms.push(fillRoom);
						while(true){
							var grew = false;
							//Select a random direction first, if it can't grow in that direction, check in order
							var randomDirection = Random.rand(0,3);
							if (this.roomCanGrow(fillRoom, addedRooms, randomDirection)){
								this.growRoom(fillRoom, randomDirection);
								grew = true;
							} else {
								for (var j = 0; j <= 3; j++){
									if (this.roomCanGrow(fillRoom, addedRooms, j)){
										this.growRoom(fillRoom, j);
										grew = true;
										break;
									}
								}
							}
							if (!grew){
								break;
							}
						}
						break hole;
					}
				}
			}
			if (noHoles)
				break;
		}
		return addedRooms;
	},
	holeAt: function(rooms, x,y){
		for (var dx = 0; dx < 5; dx++){
			for (var dy = 0; dy < 5; dy++){
				if (!this.emptySpace(x+dx, y+dy, rooms)){
					return false;
				}
			}
		}
		return true;
	},
	assignRooms: function(rooms, force){
		/** We now have a lot of empty rooms, give a function to each based on the super structure
		 * We will try several times
		 * Following room attributes are relevant:
		 * placeNorth: boolean - Room must be placed as north as possible
		 * isNextTo: string - Room must be placed as close as possible to a room with the given code
		 * southRoom: string - If there is a room in the southern exit of this room, it has to be one of the given code. Only for "placeNorth" rooms
		 * isBig: boolean - Pick one of the rooms with greatest area
		 */

		// Do we have enough big rooms in the north to satisfy requirements, can we whine?
		if (!force){
			var bigHeightThreshold = 8;
			var bigNorthRequiredRooms = 0;
			var northRequiredRooms = 0;
			var bigRequiredRooms = 0;
			var bigNorthAvailableRooms = 0;
			var northAvailableRooms = 0;
			var bigAvailableRooms = 0;

			// Gather requirements
			for (var i = 0; i < this.structure.rooms.length; i++){
				var room = this.structure.rooms[i];
				if (room.placeNorth){
					if (room.isBig){
						bigNorthRequiredRooms++;
					} else {
						northRequiredRooms++;
					}
				} else if (room.isBig){
					bigRequiredRooms++;
				} 
			}
			
			// Sum available rooms
			for (var i = 0; i < rooms.length; i++){
				var room = rooms[i];
				if (room.y == this.roomsArea.y){
					if (room.h > bigHeightThreshold)
						bigNorthAvailableRooms ++;
					else
						northAvailableRooms ++;
				} else if (room.h > bigHeightThreshold)
					bigAvailableRooms ++;
			}

			// Check if we comply
			if (bigNorthAvailableRooms < bigNorthRequiredRooms || 
				northAvailableRooms < northRequiredRooms ||
				bigAvailableRooms < bigRequiredRooms)
				return false; // Give me better rooms!
		}

		// Split the rooms by category
		var northAvailableRooms = [];
		var northBigAvailableRooms = [];
		var bigAvailableRooms = [];
		var otherAvailableRooms = [];
		for (var i = 0; i < rooms.length; i++){
			var room = rooms[i];
			if (room.y == this.roomsArea.y){
				if (room.h > bigHeightThreshold){
					northBigAvailableRooms.push(room);
				} else {
					northAvailableRooms.push(room);
				}
			} else {
				if (room.h > bigHeightThreshold){
					bigAvailableRooms.push(room);
				} else {
					otherAvailableRooms.push(room);
				}
			}
		}

		// Shuffle the rooms
		var roomsToAdd = Arrays.shuffle(this.structure.rooms);
		// but place rooms with southRoom first
		roomsToAdd = roomsToAdd.sort(function(a, b){
			return (a.southRoom && b.southRoom) ? 0 : a.southRoom ? -1 : 1;
		});
		for (var i = 0; i < roomsToAdd.length; i++){
			var requiredRoom = roomsToAdd[i];
			var room = false;
			if (requiredRoom.placeNorth){
				if (requiredRoom.isBig || northAvailableRooms.length == 0){
					room = Random.randomElementOf(northBigAvailableRooms);
				} else {
					room = Random.randomElementOf(northAvailableRooms);
				}
			} else if (requiredRoom.isBig){
				room = Random.randomElementOf(bigAvailableRooms);
			} else {
				room = Random.randomElementOf(otherAvailableRooms);
			}
			if (!room){
				// Couldn't pick from preferred? pick from any available!!
				if (otherAvailableRooms.length) room = Random.randomElementOf(otherAvailableRooms);
				if (northBigAvailableRooms.length) room = Random.randomElementOf(northBigAvailableRooms);
				if (northAvailableRooms.length) room = Random.randomElementOf(northAvailableRooms);
				if (bigAvailableRooms.length) room = Random.randomElementOf(bigAvailableRooms);
			}
			// Remove used space
			Arrays.removeObject(northBigAvailableRooms, room);
			Arrays.removeObject(northAvailableRooms, room); 
			Arrays.removeObject(bigAvailableRooms, room); 
			Arrays.removeObject(otherAvailableRooms, room);
			if (room){
				var linkeable = requiredRoom.linkeable != undefined ?  requiredRoom.linkeable : true;
				this.addRoom(room.x, room.y, requiredRoom.type, requiredRoom.type, room.w, room.h, requiredRoom, requiredRoom.level, linkeable);
				// Place south rooms
				if (requiredRoom.southRoom){
					var southRoom = this.getRoomAt(rooms, room.x + Math.floor(room.w/2), room.y + room.h+2);
					if (!southRoom){
						// There's probably a hall, or the central feature which is fine.
					} else {
						this.addRoom(southRoom.x, southRoom.y, requiredRoom.southRoom, requiredRoom.southRoom, southRoom.w, southRoom.h, requiredRoom, requiredRoom.level, true);
						Arrays.removeObject(bigAvailableRooms, southRoom); // Available space used
						Arrays.removeObject(otherAvailableRooms, southRoom); // Available space used
					}
				}
			} else {
				return false; // Give me better rooms!
			}
		}

		// Fill unused rooms with living quarters
		var remainingRooms = northBigAvailableRooms.concat(northAvailableRooms).concat(bigAvailableRooms).concat(otherAvailableRooms);
		for (var i = 0; i < remainingRooms.length; i++){
			var availableRoom = remainingRooms[i];
			this.addRoom(availableRoom.x, availableRoom.y, 'livingQuarters', 'livingQuarters*', availableRoom.w, availableRoom.h, availableRoom, 0, true);
		}
		return true;
	},
	roomCanGrow: function(room, tempRooms, direction){
		var testRoom = {
			x: room.x,
			y: room.y,
			w: room.w,
			h: room.h
		}
		switch(direction){
			case 0:
				testRoom.x --;
				testRoom.w ++;
				break;
			case 1:
				testRoom.w ++;
				break;
			case 2:
				testRoom.y --;
				testRoom.h ++;
				break;
			case 3:
				testRoom.h ++;
				break;
		}
		return this.validRoom(testRoom, tempRooms, room);
	},
	growRoom: function(room, direction){
		switch(direction){
			case 0:
				room.x --;
				room.w ++;
				break;
			case 1:
				room.w ++;
				break;
			case 2:
				room.y --;
				room.h ++;
				break;
			case 3:
				room.h ++;
				break;
		}
	},
	getRoomAt: function(rooms,x,y){
		for (var i = 0; i < rooms.length; i++){
			var room = rooms[i];
			if (x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h)
				return room;
		}
		return false;
	},
	getRealRoomAt: function(x,y,exclude){
		for (var i = 0; i < this.rooms.length; i++){
			var room = this.rooms[i];
			if (room.type === 'rooms')
				continue;
			if (room == exclude)
				continue;
			if (x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height)
				return room;
		}
		return false;
	},
	validRoom: function(room, tempRooms, skipRoom){
		// Must be inside the rooms area
		if (room.x >= this.roomsArea.x && room.x + room.w <= this.roomsArea.x + this.roomsArea.w &&
			room.y >= this.roomsArea.y && room.y + room.h <= this.roomsArea.y + this.roomsArea.h) {
			// Ok...
		} else {
			return false;
		}

		// Must not collide with other rooms (except the towers)
		for (var i = 0; i < this.rooms.length; i++){
			var existingRoom = this.rooms[i];
			if (existingRoom.type === 'tower' || existingRoom.type === 'rooms'){
				continue;
			}
			if (existingRoom.x < room.x + room.w - 1 && existingRoom.x + existingRoom.width - 1 > room.x &&
    			existingRoom.y < room.y + room.h - 1 && existingRoom.y + existingRoom.height - 1 > room.y) {
				return false;
			}
		}
		// Must not collide with other temp rooms
		for (var i = 0; i < tempRooms.length; i++){
			var existingRoom = tempRooms[i];
			if (skipRoom && skipRoom == existingRoom){
				continue;
			}
			if (existingRoom.x < room.x + room.w - 1 && existingRoom.x + existingRoom.w - 1 > room.x &&
    			existingRoom.y < room.y + room.h - 1 && existingRoom.y + existingRoom.h - 1 > room.y) {
				return false;
			}
		}
		return true;
	},
	emptySpace: function(x, y, tempRooms){
		// Must be inside the rooms area
		if (x >= this.roomsArea.x && x <= this.roomsArea.x + this.roomsArea.w &&
			y >= this.roomsArea.y && y <= this.roomsArea.y + this.roomsArea.h) {
			// Ok...
		} else {
			return false;
		}

		// Must not collide with other rooms (except the towers)
		for (var i = 0; i < this.rooms.length; i++){
			var existingRoom = this.rooms[i];
			if (existingRoom.type === 'tower' || existingRoom.type === 'rooms'){
				continue;
			}
			if (existingRoom.x < x && existingRoom.x + existingRoom.width - 1 > x &&
    			existingRoom.y < y && existingRoom.y + existingRoom.height - 1 > y) {
				return false;
			}
		}
		// Must not collide with other temp rooms
		for (var i = 0; i < tempRooms.length; i++){
			var existingRoom = tempRooms[i];
			if (existingRoom.x < x && existingRoom.x + existingRoom.w - 1 > x &&
    			existingRoom.y < y && existingRoom.y + existingRoom.h - 1 > y) {
				return false;
			}
		}
		return true;
	},
	addRoom: function(x, y, type, name, width, height, features, level, linkeable){
		var room = {
			x: x,
			y: y,
			type: type,
			name: name,
			width: width,
			height: height,
			features: features,
			level: level,
			linkeable: linkeable
		}
		this.rooms.push(room);
		return room;
	},
	linkRooms: function(){
		// Starting from the courtyard or main hall, go into each direction connection rooms if possible
		// Go westeros
		var westRoom = this.getRealRoomAt(this.centerRoom.x - 1, this.centerRoom.y + Math.floor(this.centerRoom.height/2), this.centerRoom);
		if (westRoom){
			this.linkRoom(westRoom);
			if (!this.centerRoom.westDoors){
				this.centerRoom.westDoors = [];
			}
			this.centerRoom.westDoors.push({position: this.centerRoom.y + Math.floor(this.centerRoom.height/2), cell: Cells.DOOR});
		}

		// Go wessos
		var eastRoom = this.getRealRoomAt(this.centerRoom.x + this.centerRoom.width, this.centerRoom.y + Math.floor(this.centerRoom.height/2), this.centerRoom);
		if (eastRoom){
			this.linkRoom(eastRoom);
			if (!this.centerRoom.eastDoors)
				this.centerRoom.eastDoors = [];
			this.centerRoom.eastDoors.push({position: this.centerRoom.y + Math.floor(this.centerRoom.height/2), cell: Cells.DOOR});
		}
		

		// At the end, for unconnected rooms, connect to nearby
	},
	linkRoom: function(room){
		//First, get all nearby linkeable rooms, and take note of the segments
		room.linkeable = false;
		var northRooms = this.getLinkeableRooms(room, 'north');
		var southRooms = this.getLinkeableRooms(room, 'south');
		var westRooms = this.getLinkeableRooms(room, 'west');
		var eastRooms = this.getLinkeableRooms(room, 'east');

		//Then link using all the segments
		for (var i = 0; i < northRooms.length; i++){
			var segment = northRooms[i];
			var x = Random.rand(segment.start, segment.end);
			if (!room.northDoors)
				room.northDoors = [];
			room.northDoors.push({position: x, cell: Cells.DOOR});
			this.linkRoom(segment.room);
		}


		for (var i = 0; i < southRooms.length; i++){
			var segment = southRooms[i];
			var x = Random.rand(segment.start, segment.end);
			if (!room.southDoors)
				room.southDoors = [];
			room.southDoors.push({position: x, cell: Cells.DOOR});
			this.linkRoom(segment.room);
		}

		for (var i = 0; i < westRooms.length; i++){
			var segment = westRooms[i];
			var x = Random.rand(segment.start, segment.end);
			if (!room.westDoors)
				room.westDoors = [];
			room.westDoors.push({position: x, cell: Cells.DOOR});
			this.linkRoom(segment.room);
		}

		for (var i = 0; i < eastRooms.length; i++){
			var segment = eastRooms[i];
			var x = Random.rand(segment.start, segment.end);
			if (!room.eastDoors)
				room.eastDoors = [];
			room.eastDoors.push({position: x, cell: Cells.DOOR});
			this.linkRoom(segment.room);
		}
	},
	getLinkeableRooms: function(room, direction){
		var currentSegment = false;
		var segments = [];
		switch (direction){
		case 'north': case 'south':
			start = room.x + 1;
			end = room.x + room.width - 2;
			break;
		case  'west': case  'east':
			start = room.y + 1;
			end = room.y + room.height - 2;
			break;
		}
		for (var x = start; x <= end; x++){
			var nearRoom = false;
			switch (direction){
			case 'north':
				nearRoom = this.getRealRoomAt(x, room.y - 1, room);
				break;
			case 'south':
				nearRoom = this.getRealRoomAt(x, room.y + room.height+1, room);
				break;
			case 'west':
				nearRoom = this.getRealRoomAt(room.x - 1, x, room);
				break;
			case 'east':
				nearRoom = this.getRealRoomAt(room.x + room.width +1, x, room);
				break;
			}

			if (nearRoom){
				if (!currentSegment){
					if (!nearRoom.linkeable)
						continue;
					currentSegment = {
						start: x + 1,
						room: nearRoom
					}
					segments.push(currentSegment);
				}
				if (nearRoom == currentSegment.room){
					// The segment continues
				} else {
					currentSegment.end = x - 2;
					currentSegment.room.linkeable = false;
					if (nearRoom.linkeable){
						// New segment
						currentSegment = {
							start: x + 1,
							room: nearRoom
						}
						segments.push(currentSegment);
					} else {
						currentSegment = false;
					}
				}
			} else if (currentSegment){
				// No room, segment ends
				currentSegment.end = x - 2;
				currentSegment.room.linkeable = false;
				currentSegment = false;
			}
		}
		if (currentSegment && !currentSegment.end){
			currentSegment.end = end - 1;
		}
		// room.segments = segments;
		return segments;
	}
}

module.exports = RoomsGenerator;
},{"./Arrays":"/home/administrator/git/ultimacastlegen/src/Arrays.js","./Cells":"/home/administrator/git/ultimacastlegen/src/Cells.js","./Random":"/home/administrator/git/ultimacastlegen/src/Random.js"}],"/home/administrator/git/ultimacastlegen/src/TerrainGenerator.js":[function(require,module,exports){
var Random = require('./Random');
var Cells = require('./Cells');

function TerrainGenerator(){

};

TerrainGenerator.prototype = {
	generateTerrain: function(generationParams){
		var map = [];
		for (var x = 0; x < generationParams.width; x++){
			map[x] = [];
			for (var y = 0; y < generationParams.height; y++){
				if (Random.chance(80))
					map[x][y] = Cells.GRASS_1;
				else if (Random.chance(80))
					map[x][y] = Cells.GRASS_2;
				else
					map[x][y] = Cells.TREE;
			}
		}
		return map;
	}
}

module.exports = TerrainGenerator;
},{"./Cells":"/home/administrator/git/ultimacastlegen/src/Cells.js","./Random":"/home/administrator/git/ultimacastlegen/src/Random.js"}],"/home/administrator/git/ultimacastlegen/src/ui/CanvasRenderer.js":[function(require,module,exports){
var Cells = require('../Cells');



function CanvasRenderer(config){
	this.config = config;
	this.tiles = {};
	for (key in Cells){
		var val = Cells[key];
		this.tiles[val] = new Image();
		this.tiles[val].src = 'img/'+val+'.png';
	}
}

CanvasRenderer.prototype = {
	drawSketch: function(rooms, canvas, overlay){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="16px Avatar";
		if (!overlay)
			context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 16;
		for (var i = 0; i < rooms.length; i++){
			var area = rooms[i];
			context.beginPath();
			context.rect(area.x * zoom, area.y * zoom, area.width * zoom, area.height * zoom);
			if (!overlay){
				if (area.type === 'rooms'){
					context.fillStyle = 'blue';
					context.globalAlpha = 0.5;
				}
				else{
					context.fillStyle = 'yellow';
					context.globalAlpha = 1;
				}

				context.fill();
			}
			context.lineWidth = 2;
			context.strokeStyle = 'black';
			context.stroke();
			if (area.bridges) for (var j = 0; j < area.bridges.length; j++){
				var bridge = area.bridges[j];
				context.beginPath();
				context.rect((bridge.x) * zoom, (bridge.y) * zoom, zoom, zoom);
				context.lineWidth = 2;
				context.strokeStyle = 'red';
				context.stroke();
			}
		}
		context.globalAlpha = 1;
		for (var i = 0; i < rooms.length; i++){
			var area = rooms[i];
			context.fillStyle = 'black';
			context.fillText(area.name,(area.x)* zoom + 5,(area.y + area.height/2)* zoom + 10);
		}
	},
	drawLevel: function(level, canvas){
		
	},
	drawLevelWithIcons: function(cells, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				if (cell)
					context.drawImage(this.tiles[cell], x * 14, y * 16);
			}
		}
	}
}

module.exports = CanvasRenderer;
},{"../Cells":"/home/administrator/git/ultimacastlegen/src/Cells.js"}],"/home/administrator/git/ultimacastlegen/src/ui/WebAdapter.js":[function(require,module,exports){
window.MapGenerator = require('../MapGenerator');
window.CanvasRenderer = require('./CanvasRenderer');
},{"../MapGenerator":"/home/administrator/git/ultimacastlegen/src/MapGenerator.js","./CanvasRenderer":"/home/administrator/git/ultimacastlegen/src/ui/CanvasRenderer.js"}]},{},["/home/administrator/git/ultimacastlegen/src/ui/WebAdapter.js"]);
