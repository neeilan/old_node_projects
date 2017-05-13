var app = require("express")(),
    http = require("http").Server(app),
    port = process.env.PORT;
//make app the function handler for the http server
var io = require("socket.io")(http);
//socket.io object initailized by passing the http object
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/chat.html");
});
var participants = [];
io.on("connection", function(socket) {
    console.log("A user connected");
    socket.on("chatmessage", function(msg) {
        //console.log("message: "+msg);
        io.emit("chatmessage", msg);
    });
    socket.on("isTyping", function(user) { 
        //console.log("message: "+msg);
        io.emit("isTyping", user);
    });
    socket.on("doneTyping", function(user) { 
        //console.log("message: "+msg);
        io.emit("doneTyping", user);
    });
    socket.on("disconnect", function() {
        console.log("A user disconnected");
        participants = [];
        io.emit("ping");
    });
    socket.on("newparticipant", function(name) { 
        //console.log("message: "+msg);
        participants.push(name);
        var namesList = participants.join(", ");
        io.emit("newparticipant", namesList, name);
    });
});
//to send an event to everyone, io.emit
//to send to everyone  except a certain socket, use broadcast flag (socket.broadcast.emit())
//then capture emitted event on client side
http.listen(port, function() {
    console.log("listening on 8080");
});
