/*
    启动聊天室服务端的程序
 */
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//保存所有登录过的用户
const users = [];

server.listen(3000, () => {
    console.log('服务器启动成功');
});

//处理静态资源,把public目录设置为静态资源
app.use(require('express').static('public'));

app.get('/', (req, res) => {
    //重定向到首页
    res.redirect('/index.html');
});

//监听用户连接
io.on('connection', (socket) => {
    console.log('新用户连接');
    //监听客户端发送的login请求
    socket.on('login', data => {
        //判断是否重名,从数组中找是否有这个名字
        let user = users.find(item => item.username === data.username);
        if (user) {
            //该用户存在，登录失败
            socket.emit('loginError', {msg: '登录失败'});
        } else {
            //该用户不存在,登录成功    先把用户存到数组中
            users.push(data);
            socket.emit('loginSuccess', data);

            //广播消息，有人加入到聊天室 io.emit广播事件
            io.emit('addUser', data);

            //显示目前聊天室的人数
            io.emit('userList', users);

            //保存登录成功后的用户的信息
            socket.username = data.username;
            socket.avatar = data.avatar;
        }
    });

    //监听用户断开连接 disconnect断开连接事件
    socket.on('disconnect', () => {
        //把当前用户信息从users中删除掉,findIndex找到当前用户的下标
        let idx = users.findIndex(item => item.username === socket.username);
        //删除
        users.splice(idx,1);
        //广播有人离开聊天室
        io.emit('delUser',{
            username:socket.username,
            avatar: socket.avatar
        })

        //更新userList
        io.emit('userList', users);
    })

    //监听聊天信息
    socket.on('sendMessage',data=>{
        console.log(data);
        //广播消息,如有数据库在此把数据存储
        io.emit('receiveMessage',data);
    })

    //接受图片信息
    socket.on('sendImage',data=>{
        //广播消息,如有数据库在此把数据存储
        io.emit('receiveImage',data);
    })
});