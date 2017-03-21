/*SocketIO based chat room. Extended to not echo messages
 to the client that sent them.*/

var http = require('http').createServer(handler);
var io = require('socket.io')(http);
var fs = require('fs');
var mime = require('mime-types');
var _ = require('lodash');

var app_users = [];
var ROOT = "./public";

console.log("Chat server listening on port 2406");
http.listen(2406);

function handler(req, res) {
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


/* Socket Connection */
io.on("connection", function (socket) {
    socket.emit('updateChatRoom', app_users);

    socket.on("userEnteredChatRoom", function (userEnteringChat) {
        if (userEnteringChat.username) {
            var userExists = _.find(app_users, function (user) {
                if (user.username) {
                    return user.username === userEnteringChat.username;
                } else {
                    return false;
                }
            });

            if (!userExists) {
                app_users.push(userEnteringChat);
                socket.emit("message", "Welcome, " + userEnteringChat.username + ".");
            }

            socket.broadcast.emit("updateChatRoom", app_users);
            socket.broadcast.emit("message", timestamp() + ": " + userEnteringChat.username + " has entered the chatroom.");
        }
    });

    socket.on("message", function (data) {
        socket.broadcast.emit("message", timestamp() + ", " + data.username + ": " + data.message);
    });

    socket.on("disconnect", function () {
        io.emit("message", timestamp() + ": " + socket.username + " disconnected.");
    });


    socket.on("privateMessage", function (data) {
        socket.broadcast.emit("privateChatMsg", data);
    });
});

function timestamp() {
    return new Date().toLocaleTimeString();
}
//
// function getUserList() {
//     var ret = [];
//     for (var i = 0; i < clients.length; i++) {
//         ret.push(clients[i].username);
//     }
//     return ret;
// }

