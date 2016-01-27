var Random = require('./Random');
var Arrays = require('./Arrays');

function RoomsGenerator(){};

RoomsGenerator.prototype = {
	generateMap: function(structure, generationParams){
		this.structure = structure;
		this.generationParams = generationParams;
		this.rooms = [];
		this.placeTowers();
		this.placeCentralFeature();
		this.placeEntrances();
		this.placeRooms();
		return this.rooms;
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
		});
		//NE
		this.addRoom(this.generationParams.width - def.size - 2, 1,'tower', 'Northeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				north: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				south: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'top' ? 'exit' : 'solid'
			}
		});
		//SW
		this.addRoom(1, this.generationParams.height - def.size - 2,'tower', 'Southwest Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				west: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				east: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		});
		//SE
		this.addRoom(this.generationParams.width - def.size - 2, this.generationParams.height - def.size - 2,'tower', 'Southeast Tower', def.size, def.size, {
			shape: def.circle ? 'circle' : 'square',
			walls: {
				south: def.crossWindows ? 'crossWindows' : 'solid',
				east: def.crossWindows ? 'crossWindows' : 'solid',
				north: def.verticalConnections ? 'exit' : 'solid',
				west: def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom' ? 'exit' : 'solid'
			}
		});
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		if (def.verticalConnections){
			// West corridor
			this.addRoom(
				1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2), 
				1 + def.size, 
				def.connectionCorridors.type, 'West '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 3,
				def.hallDecoration
			);
			// East corridor
			this.addRoom(
				this.generationParams.width - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2) + ((def.size - connectionWidth)%2 != 0 ? 1 : 0), 
				1 + def.size, 
				def.connectionCorridors.type, 'East '+def.connectionCorridors.type, 
				connectionWidth, 
				this.generationParams.height - 2 * def.size - 3,
				def.hallDecoration
			);
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'top'){
			// North corridor
			this.addRoom(
				1 + def.size, 
				1 + Math.floor(def.size / 2) - Math.floor(connectionWidth/2), 
				def.connectionCorridors.type, 'North '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 3,
				connectionWidth, 
				def.hallDecoration
			);
		}
		if (def.horizontalConnections === 'both' || def.horizontalConnections === 'bottom'){
			// South corridor
			this.addRoom(
				1 + def.size, 
				this.generationParams.height - 3 - Math.floor(def.size / 2) - Math.floor(connectionWidth/2)+ ((def.size - connectionWidth)%2 != 0 ? 1 : 0), 
				def.connectionCorridors.type, 'South '+def.connectionCorridors.type, 
				this.generationParams.width - 2 * def.size - 3,
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
				entranceLength,
				def
			);
		}
		// South Entrance
		if (this.structure.entrances.southExit){
			var def = this.structure.entrances.southExit;
			this.addRoom(
				Math.floor(this.generationParams.width / 2) - Math.floor(def.width /2) - 1,
				entranceLength + this.structure.central.height,
				'entrance',
				'South Entrance',
				def.width,
				entranceLength,
				def
			);
		}

	},
	placeRooms: function(){
		var def = this.structure.towers;
		var connectionWidth = def.connectionCorridors.type === 'corridor' ? 3 : def.connectionCorridors.hallWidth;
		var x = 3;
		var adjustment = (def.size - connectionWidth)%2 == 0 ? 1 : 0;
		if (def.verticalConnections){
			x = 1 + Math.floor(def.size / 2) + Math.floor(connectionWidth/2) + adjustment;
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
			area.w = this.generationParams.width - 2 * x;
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

		this.structure.rooms = Arrays.shuffle(this.structure.rooms);
		// We either suceeded or failed; remaining space should be small corridors
		for (var i = 0; i < addedRooms.length; i++){
			var room = addedRooms[i];
			var roomDef = false;
			if (this.structure.rooms[i]){
				roomDef = this.structure.rooms[i];
			} else {
				roomDef = {type: 'livingQuarters'}
			}
			this.addRoom(room.x, room.y, roomDef.type, roomDef.type, room.w, room.h);
		}
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
			if (existingRoom.x < room.x + room.w && existingRoom.x + existingRoom.width > room.x &&
    			existingRoom.y < room.y + room.h && existingRoom.y + existingRoom.height > room.y) {
				return false;
			}
		}
		// Must not collide with other temp rooms
		for (var i = 0; i < tempRooms.length; i++){
			var existingRoom = tempRooms[i];
			if (skipRoom && skipRoom == existingRoom){
				continue;
			}
			if (existingRoom.x < room.x + room.w && existingRoom.x + existingRoom.w > room.x &&
    			existingRoom.y < room.y + room.h && existingRoom.y + existingRoom.h > room.y) {
				return false;
			}
		}
		return true;
	},
	addRoom: function(x, y, type, name, width, height, features){
		this.rooms.push({
			x: x,
			y: y,
			type: type,
			name: name,
			width: width,
			height: height,
			features: features
		});
	}
}

module.exports = RoomsGenerator;