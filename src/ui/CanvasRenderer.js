var Cells = require('../Cells');

function CanvasRenderer(config){
	this.config = config;
}

CanvasRenderer.prototype = {
	drawSketch: function(rooms, canvas, overlay){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="16px Avatar";
		if (!overlay)
			context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 16;
		for (var i = 0; i < rooms.length; i++){
			var area = rooms[i];
			context.beginPath();
			context.rect(area.x * zoom, area.y * zoom, area.width * zoom, area.height * zoom);
			if (!overlay){
				if (area.type === 'rooms'){
					context.fillStyle = 'blue';
					context.globalAlpha = 0.5;
				}
				else{
					context.fillStyle = 'yellow';
					context.globalAlpha = 1;
				}

				context.fill();
			}
			context.lineWidth = 2;
			context.strokeStyle = 'black';
			context.stroke();
			if (area.bridges) for (var j = 0; j < area.bridges.length; j++){
				var bridge = area.bridges[j];
				context.beginPath();
				context.rect((bridge.x) * zoom, (bridge.y) * zoom, zoom, zoom);
				context.lineWidth = 2;
				context.strokeStyle = 'red';
				context.stroke();
			}
		}
		context.globalAlpha = 1;
		for (var i = 0; i < rooms.length; i++){
			var area = rooms[i];
			context.fillStyle = 'black';
			context.fillText(area.name,(area.x)* zoom + 5,(area.y + area.height/2)* zoom + 10);
		}
	},
	drawLevel: function(level, canvas){
		
	},
	drawLevelWithIcons: function(cells, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var tiles = {};
		tiles[Cells.FLOOR] = new Image();
		tiles[Cells.FLOOR_2] = new Image();
		tiles[Cells.WALL] = new Image();
		tiles[Cells.GRASS_1] = new Image();
		tiles[Cells.GRASS_2] = new Image();
		tiles[Cells.DOOR] = new Image();
		tiles[Cells.TREE] = new Image();
		tiles[Cells.CROSS_WINDOW] = new Image();
		tiles[Cells.FOUNTAIN] = new Image();
		tiles[Cells.WELL] = new Image();
		tiles[Cells.DIRT] = new Image();
		tiles[Cells.FLOOR].src = 'img/floor.png';
		tiles[Cells.FLOOR_2].src = 'img/floor2.png';
		tiles[Cells.WALL].src = 'img/wall.png';
		tiles[Cells.GRASS_1].src = 'img/grass1.png';
		tiles[Cells.GRASS_2].src = 'img/grass2.png';
		tiles[Cells.DOOR].src = 'img/door.png';
		tiles[Cells.TREE].src = 'img/tree.png';
		tiles[Cells.CROSS_WINDOW].src = 'img/crossWindow.png';
		tiles[Cells.FOUNTAIN].src = 'img/fountain.png';
		tiles[Cells.WELL].src = 'img/well.png';
		tiles[Cells.DIRT].src = 'img/dirt.png';

		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				if (cell)
					context.drawImage(tiles[cell], x * 16, y * 16);
			}
		}
	}
}

module.exports = CanvasRenderer;