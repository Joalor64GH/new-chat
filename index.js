const express = require('express');
const app = express();
const {
    Server
} = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let onlineUsers = [];

io.on('connection', (socket) => {
    socket.on("user connected", (username) => {
        if (!onlineUsers.includes(username)) {
            onlineUsers.push(username);
        }
        io.emit("update users", onlineUsers);
    });

    socket.on("user disconnected", (username) => {
        onlineUsers = onlineUsers.filter((user) => user !== username);
        io.emit("update users", onlineUsers);
    });
    
    socket.on('send name', (username) => {
        io.emit('send name', (username));
    });

    socket.on('send message', (chat) => {
        io.emit('send message', (chat));
    });
});

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});