const express = require("express");
const {Server} = require("socket.io");
const path = require("path")

const app = express();
const http = require('http');
const ACTIONS = require("./src/Actions");

// app.use(express.static('build'));

// app.use((req,res) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'))
// })

const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username : userSocketMap[socketId]
        }
    })
}

io.on('connection', (socket) => {
    // console.log(socket.id);

    socket.on(ACTIONS.JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username : username,
                socketId : socket.id
            })
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
             code
        })
    })

    socket.on(ACTIONS.SYNC_CODE, ({code, socketId}) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, {
            code
        })
    })

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];

        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId : socket.id,
                username : userSocketMap[socket.id],
            })
        });

        delete userSocketMap[socket.id];
        socket.leave();
    })
})

server.listen(5000, () => {
    console.log("Server running on PORT 5000")
})