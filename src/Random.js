module.exports = {
	rand: function(low, hi){
		return Math.floor(Math.random() * (hi - low + 1))+low;
	},
	randomElementOf: function(array){
    	return array[Math.floor(Math.random()*array.length)];
    },
    chance: function(chance){
		return this.rand(0,100) <= chance;
	}
}