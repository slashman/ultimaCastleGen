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
		for (var x = 0; x < 32; x++){
			for (var y = 0; y < 32; y++){
				if (this.map[x][y] === Cells.CHEST){
					// Place secret door nearby
					if (x > 16 && Random.chance(90) && this.map[x+1][y] === Cells.WALL){
						this.map[x+1][y] = Cells.FAKE_WALL;
					}
					if (x < 16 && Random.chance(90) && this.map[x-1][y] === Cells.WALL){
						this.map[x-1][y] = Cells.FAKE_WALL;
					}
				}
			}
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