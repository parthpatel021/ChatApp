const express = require('express')
const app = express();
const http = require('http');
const { addUser, rmvUser, getUser, getUserInRoom } = require('./users.js');
const cors = require('cors');
// const { Server } = require('socket.io');
const router = require('./router');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const CLIENTURL = process.env.CLIENTURL;

app.use(cors());
const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: CLIENTURL,
//         methods: ["GET", "POST"],
//     },
// });
const io = require("socket.io")(server, {
    cors: {
      origin: CLIENTURL,
      methods: ["GET", "POST"]
    }
  });

console.log(CLIENTURL);

io.on('connection', (socket) => {

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);

        // Sending Join Message to user
        socket.emit('message', { user: 'admin', text: `${user.name},welcome to the room ${user.room}` });
        // Sending joining msg to other sockets(users) in room
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined !` });

        // socket joins the room
        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room) })
        callback();
    })

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);


        io.to(user.room).emit('message' , { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUserInRoom(user.room) });

        callback();
    })
    socket.on('disconnect', () => {
        const user = rmvUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` });
        }
    })
})


app.use(router);

server.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
})


