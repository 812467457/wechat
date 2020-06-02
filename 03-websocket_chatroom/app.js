const ws = require('nodejs-websocket');
//进入消息
const TYPE_ENTER = 0;
const TYPE_LEAVE = 1;
const TYPE_MSG = 2;

//记录当前连接的用户数量
let count = 0;

const server = ws.createServer(conn => {
    console.log('新连接');
    count++;
    //给用户一个固定的名字
    conn.userName = `用户${count}`;
    //告诉所有用户，有人加入聊天室
    broadcast({
        type: TYPE_ENTER,
        msg: `${conn.userName}加入聊天室`,
        time: new Date().toLocaleDateString()
    });

    //接受到客户端的数据触发该事件
    conn.on('text', data => {
        //接受到某个用户的数据，告诉所有的用户此消息，广播
        broadcast({
            type: TYPE_MSG,
            msg: data,
            time: new Date().toLocaleDateString()
        });
    });
    //关闭连接
    conn.on('close', () => {
        console.log('关闭连接')
        count--;
        //有人退出也告诉所有的用户
        broadcast({
            type: TYPE_LEAVE,
            msg:  `${conn.userName}离开了聊天室`,
            time: new Date().toLocaleDateString()

        })
    });
    //发送异常
    conn.on('error', () => {
        console.log('异常');
    });
});

//广播
const broadcast = (msg) => {
    //server.connection表示所有的用户
    server.connections.forEach(item => {
        //遍历出每个用户，挨个发消息
        item.send(JSON.stringify(msg));
    });
}

server.listen(3000, () => {
    console.log('监听3000');
});