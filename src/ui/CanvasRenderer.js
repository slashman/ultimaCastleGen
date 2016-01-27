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
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var cells = level.cells;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var color = '#FFFFFF';
				var cell = cells[x][y];
				if (cell === 'water'){
					color = '#0000FF';
				} else if (cell === 'lava'){
					color = '#FF0000';
				} else if (cell === 'fakeWater'){
					color = '#0000FF';
				}else if (cell === 'solidRock'){
					color = '#594B2D';
				}else if (cell === 'darkRock'){
					color = '#332b1a';
				}else if (cell === 'grayRock'){
					color = '#595959';
				}else if (cell === 'cavernFloor'){
					color = '#876418';
				}else if (cell === 'downstairs'){
					color = '#FF0000';
				}else if (cell === 'upstairs'){
					color = '#00FF00';
				}else if (cell === 'stoneWall'){
					color = '#BBBBBB';
				}else if (cell === 'stoneFloor'){
					color = '#666666';
				}else if (cell === 'corridor'){
					color = '#FF0000';
				}else if (cell === 'padding'){
					color = '#00FF00';
				}else if (cell === 'bridge'){
					color = '#946800';
				}
				context.fillStyle = color;
				context.fillRect(x * zoom, y * zoom, zoom, zoom);
			}
		}
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			var color = '#FFFFFF';
			switch (enemy.code){
			case 'bat':
				color = '#EEEEEE';
				break;
			case 'lavaLizard':
				color = '#00FF88';
				break;
			case 'daemon':
				color = '#FF8800';
				break;
			}
			context.fillStyle = color;
			context.fillRect(enemy.x * zoom, enemy.y * zoom, zoom, zoom);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			var color = '#FFFFFF';
			switch (item.code){
			case 'dagger':
				color = '#EEEEEE';
				break;
			case 'leatherArmor':
				color = '#00FF88';
				break;
			}
			context.fillStyle = color;
			context.fillRect(item.x * zoom, item.y * zoom, zoom, zoom);
		}
	},
	drawLevelWithIcons: function(level, canvas){
		var canvas = document.getElementById(canvas);
		var context = canvas.getContext('2d');
		context.font="12px Georgia";
		context.clearRect(0, 0, canvas.width, canvas.height);
		var zoom = 8;
		var water = new Image();
		water.src = 'img/water.png';
		var fakeWater = new Image();
		fakeWater.src = 'img/water.png';
		var solidRock = new Image();
		solidRock.src = 'img/solidRock.png';
		var cavernFloor = new Image();
		cavernFloor.src = 'img/cavernFloor.png';
		var downstairs = new Image();
		downstairs.src = 'img/downstairs.png';
		var upstairs = new Image();
		upstairs.src = 'img/upstairs.png';
		var stoneWall = new Image();
		stoneWall.src = 'img/stoneWall.png';
		var stoneFloor = new Image();
		stoneFloor.src = 'img/stoneFloor.png';
		var bridge = new Image();
		bridge.src = 'img/bridge.png';
		var lava = new Image();
		lava.src = 'img/lava.png';
		var bat = new Image();
		bat.src = 'img/bat.png';
		var lavaLizard = new Image();
		lavaLizard.src = 'img/lavaLizard.png';
		var daemon = new Image();
		daemon.src = 'img/daemon.png';
		var treasure = new Image();
		treasure.src = 'img/treasure.png';
		var tiles = {
			water: water,
			fakeWater: fakeWater,
			solidRock: solidRock,
			cavernFloor: cavernFloor,
			downstairs: downstairs,
			upstairs: upstairs,
			stoneWall: stoneWall,
			stoneFloor: stoneFloor,
			bridge: bridge,
			lava: lava,
			bat: bat,
			lavaLizard: lavaLizard,
			daemon: daemon,
			treasure: treasure
		}
	    var cells = level.cells;
		for (var x = 0; x < this.config.LEVEL_WIDTH; x++){
			for (var y = 0; y < this.config.LEVEL_HEIGHT; y++){
				var cell = cells[x][y]; 
				context.drawImage(tiles[cell], x * 16, y * 16);
			}
		}
		for (var i = 0; i < level.enemies.length; i++){
			var enemy = level.enemies[i];
			context.drawImage(tiles[enemy.code], enemy.x * 16, enemy.y * 16);
		}
		for (var i = 0; i < level.items.length; i++){
			var item = level.items[i];
			context.drawImage(tiles['treasure'], item.x * 16, item.y * 16);
		}
	}
}

module.exports = CanvasRenderer;