$(document).ready(function () {
    var username = prompt("What's your name?");
    var socket = io(); //connect to the server that sent this page

    socket.on('connect', function () {
        if (username) {
            socket.emit("userEnteredChatRoom", {
                username: username,
                privateUsers: []
            });
        }
    });

    socket.on('updateChatRoom', function (users) {
        console.log(users);

        $("#chatUsers").html('');
        users.forEach(function (user) {
            if (user.username !== username) {
                $("#chatUsers").append("<li id=" + user.username + ">" + user.username + "</li>");
            }
        });
    });

    socket.on("message", function (data) {
        $("#chatLog").append(data + "\n");
        $('#chatLog')[0].scrollTop = $('#chatLog')[0].scrollHeight; //scroll to the bottom
    });

    //My private channel socket
    socket.on("privateChatMsg", function (data) {
        if (data.username == userName) {
            console.log(data.message)
        }
    });
    
    //////////////////////////////////////////////////

    $('#inputText').keypress(function (ev) {
        if (ev.which === 13) {
            //send message
            socket.emit("message", {username: username, message: $(this).val()});
            ev.preventDefault(); //if any
            $("#chatLog").append((new Date()).toLocaleTimeString() + ", " + username + ": " + $(this).val() + "\n");
            $(this).val(""); //empty the input
        }
    });

    /*Handler to create private chat*/
    $("#chatUsers").dblclick(function (e) {
        var username = e.target.id;
        var message = window.prompt('Enter your message to ' + username);

        if (message != null) {
            socket.emit("privateMessage", {username: username, message: message});
        }
    });

});
