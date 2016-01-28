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