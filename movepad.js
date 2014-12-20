$(document).ready(function(){
	
	window.panTiltSensivity = 20; // Change if needed

	window.G_touchPadHandles = "";
	window.G_panTiltHandles = "";
	window.socket = io(document.URL);
	changeMode("motors");
	window.G_touchdown = false;
	window.G_Tolerance = 50;
	window.G_Status = 0;
	window.G_padSize = 600;
	var $ddiv = $('#controlPad');
	var offset = $ddiv.offset();
	var width = $ddiv.outerWidth();
	var height = $ddiv.height();
	window.G_X = offset.left + width / 2;
	window.G_Y = offset.top + height / 2;
});


function changeMode(newMode){
	// There are two types of events here, touch events for mobile which are handled with javascript eventlisteners
	// and mouse events which are handled with jquery. 
	// To be able to change modes, the event listeners in Javascript, for the touch events have handles which can be used to remove them when needed.
	// the .off() function in jquery removes all of the mouse functions conveniently with no need for the handles.
	// So the mouse and touch events for one mode are removed and the new mouse and touch events are applied for the new mode.
	
	switch (newMode){
	case "motors":
		var box1 = document.getElementById('controlPad');
		box1.removeEventListener('touchstart', window.G_panTiltHandles.pTouchStart);
		box1.removeEventListener('touchmove', window.G_panTiltHandles.pTouchMove);
		box1.removeEventListener('touchend', window.G_panTiltHandles.pTouchEnd);
		$( "#controlPad" ).off(); // Remove mouseup, down etc
	   	$('#moveButton').attr("disabled", true);
		$('#ptButton').removeAttr('disabled');
	   	window.G_touchPadHandles = touchPad();
	 	break;

	case "servos":
		var box1 = document.getElementById('controlPad');
		box1.removeEventListener('touchstart', window.G_touchPadHandles.touchStrt);
		box1.removeEventListener('touchmove', window.G_touchPadHandles.touchMve);
		box1.removeEventListener('touchend', window.G_touchPadHandles.touchNd);
		$( "#controlPad" ).off(); // Remove mouseup, down etc
		$('#ptButton').attr("disabled", true);
		$('#moveButton').removeAttr('disabled');
	   	window.G_panTiltHandles = ptPad();
	 	break;
	}
}


function touchPad(){
	// Return pointers to event handler functions - so they can be removed
	var retHanldes = new Object();
	var box1 = document.getElementById('controlPad');
	var startx = 0;
	var dist = 0;

 	// Need handles of functions so they can be removed
	box1.addEventListener('touchstart', touchStrt);
	function touchStrt(e){
		window.G_touchdown = true;
		var startX = parseInt(touchobj.clientX); // get x position of touch point relative to left edge of browser;
		var startY = parseInt(touchobj.clientY); // get x position of touch point relative to left edge of browser;
		var X =  startX - window.G_X;
		var Y =  startY - window.G_Y;
		callMover(X,Y);
		e.preventDefault();
	}
	retHanldes.touchStrt = touchStrt;

	$(box1).mousedown(function(e){
		window.G_touchdown = true;
		var X =  event.pageX - window.G_X;
		var Y =  event.pageY - window.G_Y;
		callMover(X,Y);
	});

	box1.addEventListener('touchmove', touchMve);
	function touchMve(e){
		var whereX = parseInt(touchobj.clientX);
		var whereY = parseInt(touchobj.clientY);
		if (window.G_touchdown){
			var X =  whereX - window.G_X;
			var Y =  whereY - window.G_Y;
			callMover(X,Y);
		}
		e.preventDefault();
	}
	retHanldes.touchMve = touchMve;
	
	$(box1).mousemove(function( event ) {
		if (window.G_touchdown){
			var X =  event.pageX - window.G_X;
			var Y =  event.pageY - window.G_Y;
			callMover(X,Y);
		}
	});


	function callMover(X,Y){

		if ((window.G_Status !== 0)&&((Y>window.G_padSize)||(X>window.G_padSize)||(X<-window.G_padSize)||(X<-window.G_padSize))) {
			// STOPALL
			window.G_touchdown = false;
			stopper();

		}else if(X>window.G_Tolerance){
			
			if (Y<-window.G_Tolerance){

				if (window.G_Status !== 1){
					//forwardsRight
					window.G_Status = 1;
					socket.emit('move', 'forwardsRight');
					console.log("Forwards Right");
				}

			}else if(Y>window.G_Tolerance){
					
				if (window.G_Status !== 2){
					//backright
					window.G_Status = 2;
					socket.emit('move', 'backRight');
					console.log("Back Right");
				}
			
			}else {

				if (window.G_Status !== 3){
					//right
					window.G_Status = 3;
					socket.emit('move', 'right');
					console.log("Right");
				}

			}
			
		}else if(X<-window.G_Tolerance){
			
			if (Y<-window.G_Tolerance){
				
				if (window.G_Status !== 4){
					//forwardsleft
					window.G_Status = 4;
					socket.emit('move', 'forwardsLeft');
					console.log("Forwards left");
				}

			}else if(Y>window.G_Tolerance){

				if (window.G_Status !== 5){
					//backleft
					window.G_Status = 5;
					socket.emit('move', 'backLeft');
					console.log("Back left");
				}
			}else {

				if (window.G_Status !== 6){
					//left
					window.G_Status = 6;
					socket.emit('move', 'left');
					console.log("Left");
				}
			}
		}else if(Y<-window.G_Tolerance){

			if (window.G_Status !== 7){
				//forwards
				window.G_Status = 7;
				socket.emit('move', 'forwards');
					console.log("Forwards");
			}
		}else if(Y>window.G_Tolerance){

			if (window.G_Status !== 8){
				//back
				window.G_Status = 8;
				socket.emit('move', 'back');
				console.log("Back");
			}

		}else if (window.G_Status !== 0){
			// STOPALL
			stopper();
			console.log("center");
			window.G_Status = 0;
		}		
	}

 
	box1.addEventListener('touchend', touchNd);
	function touchNd(e){
		console.log("touchend");
		stopper();
	}
	retHanldes.touchNd = touchNd;

	$(box1).on('mouseup mouseout',function() {
		if (window.G_touchdown) stopper();
	});
	return retHanldes;
}

function stopper(){
	callStopper();
	var tid = setInterval(callStopper, 10000);
	window.socket.on('messageSuccess', function (data) {
		console.log(data);
  		clearInterval(tid);
		resetThings();
	});
}

function callStopper() {
	console.log("Call stopper");
	window.socket.emit('move', 'stop');
}

function resetThings(){
	window.G_touchdown = false;
	window.G_Status = 0;
	window.G_Stoppercalled = false;
}

function ptPad(){
	var retHandles = new Object();
	retHandles.lastx = retHandles.lasty = 0; 
	var $ddiv = $('#controlPad');
	retHandles.divWidth = $ddiv.outerWidth();
	retHandles.divHeight = $ddiv.height();

	var sensitivity = window.panTiltSensivity; //relates to the amount of calls you want
	//to socket io in the width and height of the touchpad (holds true on different screen sizes - subject to reload)
	//the call to servoblaster is between 50 and 250, 250 - 50 = 200
	//an offset of 150 is used in the code below to find the midpoint or 0
	retHandles.xGrad = retHandles.divWidth / sensitivity;
	retHandles.yGrad = retHandles.divHeight / sensitivity;
	retHandles.xconversion = Math.round(retHandles.divWidth / 200); 
	retHandles.yconversion = Math.round(retHandles.divHeight / 200);

	var box1 = document.getElementById('controlPad');
	box1.addEventListener('touchstart', pTouchStart);
	function pTouchStart(e){
		window.G_touchdown = true;
		var touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger);
		var startX = parseInt(touchobj.clientX); // get x position of touch point relative to left edge of browser;
		var startY = parseInt(touchobj.clientY); // get Y position of touch point relative to left edge of browser;
		var X =  startX - window.G_X;
		var Y =  startY - window.G_Y;
		panTilt(X,Y);
		e.preventDefault();
	}
	retHandles.pTouchStart = pTouchStart

	$(box1).mousedown(function(e){
		window.G_touchdown = true;
		var X =  event.pageX - window.G_X;
		var Y =  event.pageY - window.G_Y;
		panTilt(X,Y);
	});

 
	box1.addEventListener('touchmove', pTouchMove);
	function pTouchMove(e){
		var touchobj = e.changedTouches[0]; // reference first touch point for this event;
		var whereX = parseInt(touchobj.clientX);
		var whereY = parseInt(touchobj.clientY);

		if (window.G_touchdown){
			var X =  whereX - window.G_X;
			var Y =  whereY - window.G_Y;
			panTilt(X,Y);
		}
		e.preventDefault();
	}
	retHandles.pTouchMove = pTouchMove;

	$(box1).mousemove(function( event ) {
		if (window.G_touchdown){
			var X =  event.pageX - window.G_X;
			var Y =  event.pageY - window.G_Y;
			panTilt(X,Y);
		}
	});

	box1.addEventListener('touchend', touchNd);
	function touchNd(e){
		window.G_touchdown = false;
	}
	retHandles.touchNd = touchNd;

	$(box1).on('mouseup mouseout',function() {
		window.G_touchdown = false;
	});

	
	function panTilt(X,Y){
		X=-X;
		if ((Y>window.G_padSize)||(X>window.G_padSize)||(X<-window.G_padSize)||(X<-window.G_padSize)) {
			// STOPALL
			window.G_touchdown = false;
		} else { 
			if (((X-retHandles.lastx)> retHandles.xGrad)||((X-retHandles.lastx) < -retHandles.xGrad)){
				retHandles.lastx =  X;
				var value = 150 + (Math.round(X/retHandles.xconversion));	
				console.log("pan "+value);
				window.socket.emit('pan', value);
			}

			if (((Y-retHandles.lasty)> retHandles.yGrad)||((Y-retHandles.lasty) < -retHandles.yGrad)){
				retHandles.lasty =  Y;
				var value = 150 + (Math.round(Y/retHandles.yconversion));	
				console.log("tilt"+value);
				window.socket.emit('tilt', value);
			}
		}
		window.socket.on('panTiltSuccess', function (data) {
			console.log(data);
		});
	}
	return retHandles;
}

