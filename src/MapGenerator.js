var CastleStructureGenerator = require('./CastleStructureGenerator');
var RoomsGenerator = require('./RoomsGenerator');

function MapGenerator(){

};

MapGenerator.prototype = {
	generateMap: function(generationParams){
		this.generationParams = generationParams;
		this.castleStructureGenerator = new CastleStructureGenerator();
		this.roomsGenerator = new RoomsGenerator();
		var castle = {};
		castle.structure = this.castleStructureGenerator.generateMap(generationParams);
		castle.rooms = this.roomsGenerator.generateMap(castle.structure, generationParams);
		return castle;
	}
}

window.MapGenerator = MapGenerator;
module.exports = MapGenerator;