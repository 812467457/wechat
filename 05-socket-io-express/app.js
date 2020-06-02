const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000,()=>{
    console.log('监听3000');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    socket.on('clientData', (data) => {
        console.log(data);
    });
});