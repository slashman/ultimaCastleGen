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