module.exports = {
    shuffle: function(array) {
        var counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            var index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            var temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    },
    removeObject: function(array, object){
        for(var i = 0; i < array.length; i++) {
            if(array[i] === object) {
               array.splice(i, 1);
            }
        }
    }
}