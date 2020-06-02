//创建服务器
const http = require('http');
const fs = require('fs');
const app = http.createServer();


//监听request事件，请求服务时返回index.html
app.on('request', (req, res) => {
    fs.readFile(__dirname + '/index.html',
        (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
})

app.listen(3000, () => {
    console.log('监听3000');
});

//socketio依赖于nodejs服务器
const io = require('socket.io')(app);
//监听用户连接的事件
//socket表示用户的连接
//socket emit表示触发某个事件   如果向浏览器发送一个数据，需要触发浏览器注册的某个事件
//socket on表示注册某个事件，如果需要获取浏览器数据，就需要注册一个事件，等待浏览器触发
io.on('connection', socket => {
    console.log('新用户连接');
    //给浏览器发送数据emit('发送的事件','发送的事件')
    socket.emit('send', {name: 'jack'});

    //获取浏览器发送的数据,注册事件只要和触发事件一样就行
    socket.on('clientData',data=>{
        console.log(data);
    })
});