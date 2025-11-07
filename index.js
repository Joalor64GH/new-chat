const express = require('express');
const app = express();
const { Server } = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const port = 5000;

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

const messages = [];

io.on('connection', socket => {
    socket.emit('init messages', messages);

    socket.on('chat message', data => {
        messages.push(data);
        if (messages.length > 50) messages.shift();
        io.emit('chat message', data);
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));