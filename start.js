//The Server code comes straight from:
//https://gist.github.com/rpflorence/701407
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 3150;

 
app = http.createServer(function(request, response) {
 
  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }
 
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
 
    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }
 
      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

var gpio = require("pi-gpio");
var moveBot = require("./DriveClass.js");

moveBot.openAll(gpio);

var io = require('socket.io')(app);

io.on('connection', function(socket){

    socket.on('move', function(msg){
        switch (msg){
            case 'forwards':

              moveBot.rightForwards();
              moveBot.leftForwards();
                break;
        
            case 'forwardsRight':

                moveBot.stopLeft();
                moveBot.rightForwards();
                break;

            case 'right':

                moveBot.rightForwards();
                moveBot.leftBack();
                break;

            case 'backRight':

                moveBot.stopLeft();
                moveBot.rightBack();
                break;

            case 'back':

                moveBot.rightBack();
                moveBot.leftBack();
                break;

            case 'backLeft':

                moveBot.stopRight();
                moveBot.leftBack();
                break;

            case 'left':

                moveBot.leftForwards();
                moveBot.rightBack();
                break;

            case 'forwardsLeft':

                moveBot.stopRight();
                moveBot.leftForwards();
                break;

            case 'stop':

                moveBot.stopAll(function(ans){
                    socket.emit('messageSuccess',ans);
                });
                break;
        }
    });
    // http://nodejs.org/api.html#_child_processes
    var sys = require('sys')
    var exec = require('child_process').exec;
    var child;

    var dCmd = "sudo ~/PiBits/ServoBlaster/user/servod";
    exec(dCmd, function (error, stdout, stderr) {
        // sys.print('stderr: ' + stderr);
        if (error !== null) {
            console.log('Error outputted from index.js line 80: ' + error);
        }
    });

    function shExec(theCommand){
        var dString = "echo "+theCommand+" > /dev/servoblaster";
        child = exec(dString, function (error, stdout, stderr) {
            // sys.print('stderr: ' + stderr);
            if (error !== null) {
                console.log('Error outputted from index.js line 99: ' + error);
            }
        });
    }

    socket.on('pan', function(msg){
        shExec("7="+msg);
    });

    socket.on('tilt', function(msg){
        shExec("6="+msg);
    });
});