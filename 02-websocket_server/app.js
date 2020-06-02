const ws = require('nodejs-websocket');
const PORT = 3000

//创建server,每次只要有用户连接，回调执行就会给用户创建一个connect对象
const server = ws.createServer(connect => {
    console.log('用户连接成功');
    //用户传来数据，触发text事件
    connect.on('text', data => {
        console.log(`接受到用户的数据:${data}`);
        //接受到数据后给用户响应数据
        connect.sendText(data);
    });

    //连接关闭触发close事件
    connect.on('close',()=>{
        console.log('连接断开');
    });

    //注册error事件,用户端口后就会触发该异常
    connect.on('error',()=>{
        console.log('用户连接异常');
    });
});

server.listen(PORT, () => {
    console.log('监听3000');
});