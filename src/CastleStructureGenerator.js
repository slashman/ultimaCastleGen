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
		} else {
			var possibleRooms = ['livingQuarters', 'diningRoom', 'kitchen', /*'prison', 'dungeon',*/ 'hall', 'guestRoom', 'library'];
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