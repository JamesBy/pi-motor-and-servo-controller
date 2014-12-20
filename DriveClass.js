//Drive class for controlling the motors

//These are the Gpio pins for the motors 
var leftFor = 24,
	leftBak = 26,
	rightFor = 19,
	rightBak = 21;

// motor controller
var gpio = require("pi-gpio");

function dobj(){
};

dobj.openAll = function(gpio){
	gpio.open(leftFor, "output");
	gpio.open(leftBak, "output");
	gpio.open(rightFor, "output");
	gpio.open(rightBak, "output");
};

dobj.closeAll = function(gpio){
	gpio.write(leftBak, 0, function() { 
		gpio.close(leftBak); 
	});
	gpio.write(rightBak, 0, function() { 
		gpio.close(rightBak); 
	});
	gpio.write(rightFor, 0, function() { 
		gpio.close(rightFor); 
	});
	
	gpio.write(leftFor, 0, function() { 
		gpio.close(leftFor); 
		process.exit(0); // and terminate the program 
		console.log("Shut down!!");
	});
};


dobj.stopAll = function(done){
	gpio.write(rightBak, 0, function(){
		gpio.write(rightFor, 0,function(){
			gpio.write(leftBak, 0,function(){
				gpio.write(leftFor, 0,function(){
					done("I am stopped");
				});
			});
		});
	});
};


dobj.stopLeft = function(){
	gpio.write(leftBak, 0);
	gpio.write(leftFor, 0);

};

dobj.stopRight = function(){
	gpio.write(rightBak, 0);
	gpio.write(rightFor, 0);
};

dobj.rightForwards=  function(){
	gpio.write(rightBak, 0,function(){
		gpio.write(rightFor, 1);
	});
};

dobj.rightBack = function(){
	gpio.write(rightFor, 0,function(){
		gpio.write(rightBak, 1);
	});
};

dobj.leftForwards = function(){
	gpio.write(leftBak, 0,function(){
		gpio.write(leftFor, 1);
	});
};

dobj.leftBack = function(){
	gpio.write(leftFor, 0,function(){
		gpio.write(leftBak, 1);
	});
};

module.exports = dobj;










