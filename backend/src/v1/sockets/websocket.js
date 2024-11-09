// src/websocket.js
const { Server } = require('socket.io');

const setupWebSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('message', (data) => {
            console.log('Received message:', data);

            // Emit message to specific role or customer
            if (data.toRole === 'admin') {
                io.to('adminRoom').emit('message', data);
            } else if (data.toRole === 'customer') {
                io.to(data.customerId).emit('message', data);
            } else {
                io.emit('message', data);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};

module.exports = setupWebSocket;
