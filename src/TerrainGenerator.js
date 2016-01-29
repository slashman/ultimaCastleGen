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