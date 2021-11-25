const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });

const distDir = __dirname + "/dist/";
app.use(express.static(distDir));

const users = {};

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-connected', name);
    });
    socket.on('send-chat-message', content => {
        socket.broadcast.emit('chat-message', { content, sender: users[socket.id] });
    });
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id]);
        delete users[socket.id];
    });
}); 

server.listen(process.env.PORT || 8080, () => {
    console.log("App server now running on port", server.address().port);
});
