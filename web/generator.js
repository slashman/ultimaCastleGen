(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function MapGenerator(){

};

MapGenerator.prototype = {
	generateMap: function(generationParams){
		this.generationParams = generationParams;
		return this.generateHighLevelStructure();
	},
	generateHighLevelStructure: function(){
		var castle = {};
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
			size: chance (80) ? 'big' : 'small'
		}
	},
	selectSurroundings: function(){
		return {
			hasMoat: chance(50)
		}
	},
	selectEntrances: function(){
		var entranceStructure = {};
		if (chance(50)){
			entranceStructure.northExit = this.selectEntrance(false);
		}
		entranceStructure.southExit = this.selectEntrance(true);
		return entranceStructure;
	},
	selectEntrance: function(mainEntrance){
		var entranceStructure = {};
		entranceStructure.hasFloor = chance(50);
		entranceStructure.hasCrossWindows = chance(50);
		entranceStructure.lighting = randomElementOf(['none', 'torches', 'firepits']);
		entranceStructure.hasBanners = mainEntrance && chance(60);
		return entranceStructure;
	},
	selectTowers: function(){
		var towerStructure = {};
		towerStructure.size = 5 + rand(0,2) * 2;
		towerStructure.crossWindows = chance(50);
		towerStructure.circle = chance(50);

		towerStructure.verticalConnections = chance(50);
		towerStructure.horizontalConnections = randomElementOf(['both', 'top', 'bottom']);
		towerStructure.connectionCorridors = {};
		if (chance(50)){
			towerStructure.connectionCorridors.type = 'corridor';
		} else {
			towerStructure.connectionCorridors.type = 'halls';
			towerStructure.connectionCorridors.hallDecoration = {
				torches: chance(50),
				plants: chance(50),
				columns: chance(50),
				fountains: chance(50)
			}
			towerStructure.connectionCorridors.hallWidth = rand(3,5);
		}
		return towerStructure;
	},
	selectCentral: function(){
		var centralStructure = {};
		if (chance(50)){
			centralStructure.type = 'courtyard';
			if (chance(50)){
				centralStructure.centralFeature = 'fountain';
				if (chance(50)){
					centralStructure.additionalFountains = true;
					centralStructure.fountainSymmetry = randomElementOf(['x', 'y', 'full']);
				}
				centralStructure.hasSmallLake = chance(50);
			} else {
				centralStructure.centralFeature = 'well';
			}
			centralStructure.connectionWithRooms = {
				type: randomElementOf(['radial', 'around']),
				terrain: randomElementOf(['floor', 'dirt'])
			};
		} else {
			centralStructure.type = 'mainHall';
			centralStructure.hasSpecialFloor = chance(50);
			if (chance(50)){
				centralStructure.centralFeature = 'fountain';
			}
			centralStructure.hasFireplace = chance(50);
		}
		centralStructure.width = rand(9,15);
		if (chance(50)){
			centralStructure.height = rand(9,15);
		} else {
			centralStructure.height = centralStructure.width;
		}
		centralStructure.shape = randomElementOf(['square', 'circle', 'cross']);
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
				room.freeSpace = rand(0, 50);
				break;
			case 'guestRoom':
				room.beds = rand(1,2);
				room.mirror = chance(50);
				room.piano = chance(30);
				room.fireplace = chance(50);
				break;
			case 'storage':
				room.filled = rand(60,90);
				room.barrels = rand(0,room.filled);
				room.boxes = room.filled - room.barrels;
				break;
			case 'diningRoom':
				room.luxury = rand(1,3);
				room.fireplace = chance(50);
				break;
			case 'kitchen':
				room.filled = rand(0,20);
				room.barrels = rand(0,room.filled);
				room.boxes = room.filled - room.barrels;
				room.hasOven = chance(50);
				break;
			case 'throneRoom':
				room.hasCarpet = chance(70);
				room.linedWithColumns = chance(30);
				room.linedWithTorches = chance(70);
				room.hasSecondaryThrone = chance(50);
				room.hasMagicOrb = chance(50);
				break;
			case 'lordQuarters':
				room.piano = chance(50);
				room.clock = chance(50);
				room.bookshelf = chance(70);
				room.fireplace = chance(80);
				break;
			case 'hall':
				room.torches = chance(50);
				room.plants = chance(50);
				room.columns = chance(50);
				room.fountains = chance(50);
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
			room.type = randomElementOf(possibleRooms);
		}
		this.currentRooms[room.type] = true;
		return room;
	}
}

function rand(low, hi){
	return Math.floor(Math.random() * (hi - low + 1))+low;
}

function randomElementOf(array){
    return array[Math.floor(Math.random()*array.length)];
}

function chance(chance){
	return rand(0,100) <= chance;
}

window.MapGenerator = MapGenerator;
module.exports = MapGenerator;
},{}]},{},[1]);
