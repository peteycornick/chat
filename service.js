const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let currentInput = "";
let messages = [];
// Strictly allows a-z, 0-9, spaces, and . ! ? (Max 160 chars)
const VALIDATION_REGEX = /^[a-zA-Z0-9.!? ]{0,160}$/i;
const ONE_HOUR_MS = 60 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    const originalLength = messages.length;
    messages = messages.filter(msg => (now - msg.timestamp) < ONE_HOUR_MS);
    if (messages.length !== originalLength) {
        io.emit('messageUpdate', messages);
    }
}, 10000);

io.on('connection', (socket) => {
    socket.emit('messageUpdate', messages);
    socket.emit('inputUpdate', currentInput);

    socket.on('type', (text) => {
        if (text === "" || VALIDATION_REGEX.test(text)) {
            currentInput = text;
            socket.broadcast.emit('inputUpdate', currentInput);
        }
    });

    socket.on('submit', () => {
        if (currentInput.trim() !== "") {
            messages.push({
                id: Date.now(),
                text: currentInput.trim(),
                timestamp: Date.now()
            });

            if (messages.length > 25) {
                messages.shift();
            }

            currentInput = "";
            io.emit('messageUpdate', messages);
            io.emit('inputUpdate', currentInput);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});