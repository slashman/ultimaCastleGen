(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
				room.linedWithColumns = Random.chance(30);
				room.linedWithTorches = Random.chance(70);
				room.hasSecondaryThrone = Random.chance(50);
				room.hasMagicOrb = Random.chance(50);
				room.placeNorth = true;
				room.southRoom = 'throneHall';
				room.isBig = true;
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
		} else if (!this.currentRooms.livingQuarters){
			room.type = 'livingQuarters';
		} else if (!this.currentRooms.diningRoom){
			room.type = 'diningRoom';
		} else if (!this.currentRooms.kitchen){
			room.type = 'kitchen';
		} else {
			var possibleRooms = ['livingQuarters', 'diningRoom', 'kitchen', 'prison', 'dungeon', 'hall', 'guestRoom', 'library'];
			if (!this.currentRooms.forge){
				possibleRooms.push('forge');
			}
			room.type = Random.randomElementOf(possibleRooms);
		}
		this.currentRooms[room.type] = true;
		return room;
	}
}

module.exports = CastleStructureGenerator;
},{"./Random":5}],3:[function(require,module,exports){
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
};
},{}],4:[function(require,module,exports){
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
		castle.structure = this.castleStructureGenerator.generateMap(generationParams);
		castle.rooms = this.roomsGenerator.generateMap(castle.structure, generationParams);
		castle.map = this.terrainGenerator.generateTerrain(generationParams);
		this.roomBuilder.buildRooms(castle.map, castle.rooms);
		return castle;
	}
}

module.exports = MapGenerator;
},{"./CastleStructureGenerator":2,"./RoomBuilder":6,"./RoomsGenerator":7,"./TerrainGenerator":8}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
			this.map[midx-1][midy+1] = Cells.WATER;
			this.map[midx-1][midy-1] = Cells.WATER;
			this.map[midx][midy+1] = Cells.WATER;
			this.map[midx][midy] = Cells.WATER;
			this.map[midx][midy-1] = Cells.WATER;
			this.map[midx+1][midy] = Cells.WATER;
			this.map[midx+1][midy+1] = Cells.WATER;
			this.map[midx+1][midy-1] = Cells.WATER;
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
},{"./Arrays":1,"./Cells":3,"./Random":5}],7:[function(require,module,exports){
var Random = require('./Random');
var Arrays = require('./Arrays');

function RoomsGenerator(){};

RoomsGenerator.prototype = {
	generateMap: function(structure, generationParams){
		this.structure = structure;
		this.generationParams = generationParams;
		this.rooms = [];
		this.placeFoundations();
		this.placeTowers();
		this.placeCentralFeature();
		this.placeEntrances();
		var retries = 0;
		while(true){
			var emptyRooms = this.placeRooms();
			var assigned = this.assignRooms(emptyRooms);
			if (!assigned){
				if (retries++ < 50){
					continue;
				} else {
					this.assignRooms(emptyRooms, true);
				}
			}
			break;
		}
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
			-1
		);
	},

	placeTowers: function(){
		var def = this.structure.towers;
		/*
			{
				size: 5, // 5, 7 or 9
				crossWindows: true, // Defines if the walls have cross windows to the outside
				circle: true, // Defines if the shape of the room is a circle
				verticalConnections: false, // Defines if NW-SW and NE-SE towers are connected
				horizontalConnections: 'both', // If 'both', NW-NE and SW-SE are connected, if 'top' only NW and NE are connected, if 'bottom' only SW and SW towers are connected
				connectionCorridors: {
					type: 'corridor' // If 'corridor', towers are linked by thin 1 space corridors. If 'halls' then they are connected by wide decorated halls.
					hallDecoration: { // Only for halls
						torches: true,
						plants: false,
						columns: false,
						fountains: true
					}
					hallWidth: 4 // 3, 4 or 5
				}
			}
		*/
		//NW
		this.addRoom(1, 1,'tower', 'Northwest Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				north: def.crossWindows ? 'crossWindows' : 'solid',
				west: def.crossWindows ? 'crossWindows' : 'solid',
				south: def.verticalConnections ? 'exit' : 'solid',
				east: def.horizontalConnections === 'both' || def.horizontalConnections === 'top' ? 'exit' : 'solid'
			}
		}, 1);
		//NE
		this.addRoom(this.generationParams.width - def.size - 2, 1,'tower', 'Northeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				north: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				south: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'top' ? 'exit' : 'solid'
			}
		}, 1);
		//SW
		this.addRoom(1, this.generationParams.height - def.size - 2,'tower', 'Southwest Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				west: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				east: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		}, 1);
		//SE
		this.addRoom(this.generationParams.width - def.size - 2, this.generationParams.height - def.size - 2,'tower', 'Southeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		}, 1);
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		if (def.verticalConnections){
			// West corridor
			this.addRoom(
				1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2), 
				1 + def.size - 1, 
				def.connectionCorridors.type, 'West '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 1,
				def.hallDecoration
			);
			// East corridor
			this.addRoom(
				this.generationParams.width - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2) + ((def.size - connectionWidth)%2 != 0 ? 1 : 0), 
				1 + def.size - 1, 
				def.connectionCorridors.type, 'East '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 1,
				def.hallDecoration
			);
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'top'){
			// North corridor
			this.addRoom(
				1 + def.size - 1, 
				1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2), 
				def.connectionCorridors.type, 'North '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 1,
				connectionWidth, 
				def.hallDecoration
			);
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom'){
			// South corridor
			this.addRoom(
				1 + def.size - 1, 
				this.generationParams.height - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2)+ ((def.size - connectionWidth)%2 != 0 ? 1 : 0), 
				def.connectionCorridors.type, 'South '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 1,
				connectionWidth, 
				def.hallDecoration
			);
		}
	},
	placeCentralFeature: function(){
		/*
		{
			type: 'courtyard',
			centralFeature: 'fountain', // 'fountain' / 'well'
			additionalFountains: true, // only for 'fountain'
			fountainSymmetry: 'x', // Only for 'fountain' with additionalFountains ['x', 'y', 'full'];
			hasSmallLake: false // only for 'fountain'
			connectionWithRooms: {
				type: 'radial' // ['radial', 'around'],
				terrain: 'floor'  // ['floor', 'dirt'])
			},
			width: 11, // 9, 11, 13, 15
			height: 11, // 9, 11, 13, 15
			shape: 'square' // ['square', 'circle', 'cross']
		}

		{
			type: 'mainHall',
			centralFeature: 'fountain', // 'fountain' / undefined
			hasSpecialFloor: true, 
			hasFireplace: true,
			width: 11, // 9, 11, 13, 15
			height: 11, // 9, 11, 13, 15
			shape: 'square' // ['square', 'circle', 'cross']
		}
		*/
		var def = this.structure.central;
		this.addRoom(
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
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				0,
				'entrance',
				'North Entrance',
				def.width,
				entranceLength + 1,
				def,
				1
			);
		}
		// South Entrance
		if (this.structure.entrances.southExit){
			var def = this.structure.entrances.southExit;
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				entranceLength + this.structure.central.height - 1,
				'entrance',
				'South Entrance',
				def.width,
				entranceLength,
				def,
				1
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
		/*this.addRoom(
			x,
			y,
			'rooms',
			'',
			//Math.floor(this.generationParams.width / 2) - x,
			this.generationParams.width -  2 * x - 1,
			yEnd - y + 1
		);*/
		var area = {
			x: x,
			y: y,
			w: Math.floor(this.generationParams.width / 2) - x,
			h: yEnd - y + 1
		};
		// Brute force! Let's try a lot of times to fit the rooms in the space we have!
		var roomsToPlace = Math.ceil(this.structure.rooms.length / 2);
		this.roomsArea = area;
		var minHeight = 3;
		var maxHeight = 5;
		var minWidth = 3;
		var maxWidth = 5;
		var addedRooms = [];
		for (var i = 0; i < 100; i++){
			for (var j = 0; j < 1000; j++){
				var room = {
					x: Random.rand(area.x, area.x + area.w - 2 - minWidth),
					y: Random.rand(area.y, area.y + area.h - 2 - minHeight),
					w: Random.rand(minWidth, maxWidth),
					h: Random.rand(minHeight, maxHeight),
				};
				if (this.validRoom(room, addedRooms)){
					addedRooms.push(room);
					roomsToPlace--;
					if (roomsToPlace == 0)
						break;
				}
			}
			if (roomsToPlace == 0)
				break;
			roomsToPlace = Math.ceil(this.structure.rooms.length / 2);
			addedRooms = [];
		}
		
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
		return addedRooms;
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

		var addedRooms = []; //TODO: Remove
		
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
				addedRooms.push({x: room.x, y: room.y, name: requiredRoom.type, type: requiredRoom.type, w: room.w, h: room.h});	
				// Place south rooms
				if (requiredRoom.southRoom){
					var southRoom = this.getRoomAt(rooms, room.x + Math.floor(room.w/2), room.y + room.h+2);
					if (!southRoom){
						// There's probably a hall, or the central feature which is fine.
					} else {
						addedRooms.push({x: southRoom.x, y: southRoom.y, name: requiredRoom.southRoom, type: requiredRoom.southRoom, w: southRoom.w, h: southRoom.h});
						Arrays.removeObject(bigAvailableRooms, southRoom); // Available space used
						Arrays.removeObject(otherAvailableRooms, southRoom); // Available space used
					}
				}
			} else {
				console.log("No room for "+requiredRoom.type)
			}
		}

		// Fill unused rooms with halls (?)
		var remainingRooms = northBigAvailableRooms.concat(northAvailableRooms).concat(bigAvailableRooms).concat(otherAvailableRooms);
		for (var i = 0; i < remainingRooms.length; i++){
			var availableRoom = remainingRooms[i];
			addedRooms.push({x: availableRoom.x, y: availableRoom.y, name: 'hall*', type: 'hall*', w: availableRoom.w, h: availableRoom.h});
		}
			
		// Officially add the rooms
		// TODO: Not needed anymore
		for (var i = 0; i < addedRooms.length; i++){
			var room = addedRooms[i];
			this.addRoom(room.x, room.y, room.type, room.type, room.w, room.h);
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
	addRoom: function(x, y, type, name, width, height, features, level){
		this.rooms.push({
			x: x,
			y: y,
			type: type,
			name: name,
			width: width,
			height: height,
			features: features,
			level: level
		});
	}
}

module.exports = RoomsGenerator;
},{"./Arrays":1,"./Random":5}],8:[function(require,module,exports){
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
},{"./Cells":3,"./Random":5}],9:[function(require,module,exports){
var Cells = require('../Cells');

function CanvasRenderer(config){
	this.config = config;
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
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var tiles = {};
		tiles[Cells.FLOOR] = new Image();
		tiles[Cells.FLOOR_2] = new Image();
		tiles[Cells.WALL] = new Image();
		tiles[Cells.GRASS_1] = new Image();
		tiles[Cells.GRASS_2] = new Image();
		tiles[Cells.DOOR] = new Image();
		tiles[Cells.TREE] = new Image();
		tiles[Cells.CROSS_WINDOW] = new Image();
		tiles[Cells.FOUNTAIN] = new Image();
		tiles[Cells.WELL] = new Image();
		tiles[Cells.DIRT] = new Image();
		tiles[Cells.WATER] = new Image();
		tiles[Cells.FIREPLACE] = new Image();
		tiles[Cells.FLOOR].src = 'img/floor.png';
		tiles[Cells.FLOOR_2].src = 'img/floor2.png';
		tiles[Cells.WALL].src = 'img/wall.png';
		tiles[Cells.GRASS_1].src = 'img/grass1.png';
		tiles[Cells.GRASS_2].src = 'img/grass2.png';
		tiles[Cells.DOOR].src = 'img/door.png';
		tiles[Cells.TREE].src = 'img/tree.png';
		tiles[Cells.CROSS_WINDOW].src = 'img/crossWindow.png';
		tiles[Cells.FOUNTAIN].src = 'img/fountain.png';
		tiles[Cells.WELL].src = 'img/well.png';
		tiles[Cells.DIRT].src = 'img/dirt.png';
		tiles[Cells.WATER].src = 'img/water.png';
		tiles[Cells.FIREPLACE].src = 'img/fireplace.png';

		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				if (cell)
					context.drawImage(tiles[cell], x * 16, y * 16);
			}
		}
	}
}

module.exports = CanvasRenderer;
},{"../Cells":3}],10:[function(require,module,exports){
window.MapGenerator = require('../MapGenerator');
window.CanvasRenderer = require('./CanvasRenderer');
},{"../MapGenerator":4,"./CanvasRenderer":9}]},{},[10]);
