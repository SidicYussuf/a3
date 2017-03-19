/*SocketIO based chat room. Extended to not echo messages
to the client that sent them.*/

var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');

var clients = [];

http.listen(2406);

console.log("Chat server listening on port 2406");

var ROOT = "./public";

var userInfo = [];

function handler(req, res) {

    //process the request
    console.log("Request for: " + req.url);
    var filename = ROOT + req.url;

    var code = 500;
    var data = "";
    if (fs.existsSync(filename)) {
        var stats = fs.statSync(filename);
        if (stats.isDirectory()) {
            filename += "chatRoom.html";
        }
        console.log("Getting file: " + filename);
        data = fs.readFileSync(filename);
        code = 200;

    } else {
        console.log("File not found");
        code = 404;
        data = fs.readFileSync(ROOT + "/404.html");
    }

    // content header
    res.writeHead(code, {
        'content-type': mime.lookup(filename) || 'text/html'
    });
    // write message and signal communication is complete
    res.end(data);
}

io.on("connection", function(socket) {
    console.log("Got a connection");
    var username;
    socket.on("intro", function(data) {
        socket.username = data;
        clients.push(socket);
        var userList = {
            user: getUserList()
        };
        console.log(userList.user);
        socket.broadcast.emit("message", timestamp() + ": " + socket.username + " has entered the chatroom.");
        socket.emit("message", "Welcome, " + socket.username + ".");

				socket.emit("users", userList);
    });

    socket.on("message", function(data) {
        console.log("got message: " + data);
        socket.broadcast.emit("message", timestamp() + ", " + socket.username + ": " + data);

    });

    socket.on("disconnect", function() {
        console.log(socket.username + " disconnected");
        io.emit("message", timestamp() + ": " + socket.username + " disconnected.");
    });

    socket.on("privateChat", function(data) {
        socket.broadcast.emit("privateChatMsg", data);
    });

});

function timestamp() {
    return new Date().toLocaleTimeString();
}

function getUserList() {
    var ret = [];
    for (var i = 0; i < clients.length; i++) {
        ret.push(clients[i].username);
    }
    return ret;
}

