$(document).ready(function() {



    $("button").click(function(){
        $("p").dblclick();
    });

    var userName = prompt("What's your name?") || "User";

    var socket = io(); //connect to the server that sent this page
    socket.on('connect', function() {
        socket.emit("intro", userName);
    });

    $('#inputText').keypress(function(ev) {
        if (ev.which === 13) {
            //send message
            socket.emit("message", $(this).val());
            ev.preventDefault(); //if any
            $("#chatLog").append((new Date()).toLocaleTimeString() + ", " + userName + ": " + $(this).val() + "\n")
            $(this).val(""); //empty the input
        }
    });

    socket.on("message", function(data) {
        $("#chatLog").append(data + "\n");
        $('#chatLog')[0].scrollTop = $('#chatLog')[0].scrollHeight; //scroll to the bottom
    });

    socket.on("users", function(data) {
        for(var i = 0; i < data.user.length; i++){
            $("#chatUsers").append("\n" + data.user[i] + "\n");
        }
    });





});
