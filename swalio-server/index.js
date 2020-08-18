const { v4: uuidv4 } = require('uuid');
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

var privateKey = fs.readFileSync('./certificates/privatekey.pem').toString();
var certificate = fs.readFileSync('./certificates/certificate.pem').toString();

var credentials = {key: privateKey, cert: certificate};

const httpServer = require("http").createServer(app);
const httpsServer = require("https").createServer(credentials, app);

var io = require("socket.io")(httpServer, { origins: "*:*" });


const PORT = process.env.PORT || 6600;
// signaling

let rooms = [];

io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('create or join', function (data) {
        let { room } = data;
        console.log('create or join to room ', room);
        
        var myRoom = io.sockets.adapter.rooms[room] || { length: 0 };
        var numClients = myRoom.length;

        console.log(room, ' has ', numClients, ' clients');

        if (numClients == 0) {
            room = uuidv4();
            socket.join(room);
            let members = {
                room: room,
                members: [data.name]
            }
            rooms.push(members);
            socket.emit('created', { room, clients: numClients+1, members: members.members });
        } else if (numClients == 1) {
            socket.join(room);
            let temp = rooms.filter(e => e.room == room)[0];
            let arr = temp.members;
            arr.push(data.name);
            temp.members = arr;
            rooms.push(temp);
            socket.emit('joined', { room, clients: numClients+1, members: temp.members });
        } else {
            socket.emit('full', { room, clients: numClients+1 });
        }
    });

    socket.on('ready', function (room){
        console.log('ready', room);
        socket.broadcast.to(room).emit('ready');
    });

    socket.on('candidate', function (event){
        socket.broadcast.to(event.room).emit('candidate', event);
    });

    socket.on('offer', function(event){
        console.log('offer', event.room);
        socket.broadcast.to(event.room).emit('offer',event.sdp);
    });

    socket.on('answer', function(event){
        socket.broadcast.to(event.room).emit('answer',event.sdp);
    });

});

// listener
httpServer.listen(7000, function () {
    console.log('listening on', 7000);
});

httpsServer.listen(7433, function () {
    console.log('HTTPS listening on', 7433);
});