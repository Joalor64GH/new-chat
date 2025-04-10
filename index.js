const express = require('express');
const app = express();
const {
    Server
} = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

const onlineUsers = {};

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('send name', (username) => {
        onlineUsers[socket.id] = data.username;
        io.emit("update users", Object.values(onlineUsers));
        io.emit('send name', (username));
    });

    socket.on('send message', (chat) => {
        io.emit('send message', (chat));
    });

    socket.on("disconnect", () => {
        delete onlineUsers[socket.id];
        io.emit("update users", Object.values(onlineUsers)); 
    });
});

server.listen(port, () => {
    console.log(`Server is listening at the port: ${port}`);
});