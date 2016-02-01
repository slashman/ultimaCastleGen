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