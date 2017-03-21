$(document).ready(function () {
    var username = prompt("What's your name?");
    var myContacts = {contacts: [], blockedContacts: []};
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
        myContacts.contacts = users;
        updateContactListView(users);
    });

    socket.on("message", function (data) {
        $("#chatLog").append(data + "\n");
        $('#chatLog')[0].scrollTop = $('#chatLog')[0].scrollHeight; //scroll to the bottom
    });

    //My private channel socket
    socket.on("privateChatMsg", function (data) {
        if (data.recipient == username) {
            var reply = prompt(data.message);
            if (reply) {
                socket.emit("privateMessage", {
                    username: username,
                    recipient: data.username,
                    message: reply
                });
            }
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
        var recipient = e.target.id;
        var message = window.prompt('Enter your message to ' + recipient);

        if (message) {
            socket.emit("privateMessage", {
                username: username,
                recipient: recipient,
                message: message
            });
        }
    });

    /*Handler to blocking user*/
    $("#chatUsers").mousedown(function (e) {
        if (e.shiftKey) {
            var userToBlock = e.target.id;
            var arrayOfUpdatedContacts = _.filter(myContacts.contacts, function (contact) {
                return contact.username !== userToBlock;
            });

            myContacts.contacts = arrayOfUpdatedContacts;
            myContacts.blockedContacts.push(userToBlock);

            updateContactListView(myContacts.contacts);
        }
    });

    function updateContactListView(users) {
        $("#chatUsers").html('');
        users.forEach(function (user) {
            if (user.username !== username) {
                $("#chatUsers").append("<li id=" + user.username + ">" + user.username + "</li>");
            }
        });
    }

});
