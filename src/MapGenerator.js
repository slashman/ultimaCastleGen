var CastleStructureGenerator = require('./CastleStructureGenerator');

function MapGenerator(){

};

MapGenerator.prototype = {
	generateMap: function(generationParams){
		this.generationParams = generationParams;
		this.castleStructureGenerator = new CastleStructureGenerator();
		return this.castleStructureGenerator.generateMap(generationParams);
	}
}

window.MapGenerator = MapGenerator;
module.exports = MapGenerator;