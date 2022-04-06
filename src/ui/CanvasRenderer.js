var Cells = require('../Cells');



function CanvasRenderer(config){
	this.config = config;
	this.tiles = {};
	for (key in Cells){
		var val = Cells[key];
		this.tiles[val] = new Image();
		totalImages++;
		this.tiles[val].onload = increaseLoadedCount;
		this.tiles[val].src = 'img64/'+val+'.png';
	}
	setTimeout(checkImagesLoaded, 500);
}

var totalImages = 0;
var loadedImages = 0;

function increaseLoadedCount(){
	loadedImages++;
}

function checkImagesLoaded(){
	if (loadedImages == totalImages){
		imagesLoaded();
	} else {
		setTimeout(checkImagesLoaded, 500);
	}
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
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				if (cell)
					context.drawImage(this.tiles[cell], x * 32, y * 32, 32, 32);
			}
		}
	}
}

module.exports = CanvasRenderer;