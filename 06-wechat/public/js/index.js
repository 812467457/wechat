/*
    聊天室主要功能
 */

//连接socketio
let socket = io('http://localhost:3000');

//定义两个全局变量保存username和avatar
var username;
var avatar;

/*
    登录功能
 */

//选择头像，在li上注册一个点击事件，加now类 addClass:添加一个类 siblings:移除其他li上的类
$('#login_avatar li').on('click', function () {
    $(this).addClass('now').siblings().removeClass('now');
});

//点击按钮登录
$('#loginBtn').on('click', function () {
    //获取用户名,去空格
    let username = $('#username').val().trim();
    if (!username) {
        alert('请输入用户名');
        return
    }
    //获取头像 li.now表选中的li   attr('src')拿到头像具体路径
    let avatar = $('#login_avatar li.now img').attr('src');

    //和服务器通信,把用户名和头像传输到服务器
    socket.emit('login', {
        username: username,
        avatar: avatar
    });
});

//监听登录失败的消息
socket.on('loginError', data => {
    alert('登录失败,用户名已经存在');
});
//监听登录成功的消息
socket.on('loginSuccess', data => {
    //显示聊天框，隐藏聊天窗口  fadeOut,fadeIn淡出淡入效果
    $('.login_box').fadeOut();
    $('.container').fadeIn();
    //设置登录成功后的用户信息
    $('.avatar_url').attr('src', data.avatar);
    $('.user-list .username').text(data.username);

    username = data.username;
    avatar = data.avatar;
});

//监听新用户加入的消息
socket.on('addUser', data => {
    //添加一条系统消息
    $('.box-bd').append(
        `<div class="system">
                <p class="message_system">
                    <span class="content">${data.username}加入了群聊</span>
                </p>
            </div>`
    )
    scrollIntoView()
});

//监听用户列表消息，为每个用户创建连接
socket.on('userList', data => {
    //把userList中的数据动态显示到左侧菜单
    $('.user-list ul').html('');    //每次循环完把列表设为空，否则会重复叠加
    data.forEach(item => {
            $('.user-list ul').append(
                `<li class="user">
                <div class="avatar"><img src="${item.avatar}" alt=""/></div>
                <div class="name">${item.username}</div>
            </li>`
            )
        }
    )
    //显示用户人数
    $('#userCount').text(data.length);
});

//监听删除用户消息
socket.on('delUser', data => {
    //添加一条系统消息
    $('.box-bd').append(
        `<div class="system">
                <p class="message_system">
                    <span class="content">${data.username}离开了群聊</span>
                </p>
            </div>`
    )
    scrollIntoView()
});

//聊天功能
$('.btn-send').on('click', () => {
    //获取聊天内容
    let content = $('#content').html();
    //制空聊天区
    $('#content').html('');
    //判断是否空数据
    if (!content) {
        return alert('请输入内容');
    }
    //发给服务器
    socket.emit('sendMessage', {
        msg: content,
        username: username,
        avatar: avatar
    })
})

//监听聊天消息
socket.on('receiveMessage', data => {
    //把接受到的消息显示在聊天窗口
    //判断消息是自己或别人的
    if (data.username === username) {
        //自己的消息
        $('.box-bd').append(
            ` <div class="message-box">
                <div class="my message">
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    } else {
        //别人的消息
        $('.box-bd').append(
            `<div class="message-box">
                <div class="other message">
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content">
                        <div class="nickname">${data.username}</div>
                        <div class="bubble">
                            <div class="bubble_cont">${data.msg}</div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
    scrollIntoView();

})

function scrollIntoView() {
    //使用scrollIntoView()滚动到底部,children(':last')表示找到最后一个子元素,get(0)获取元素的dom对象
    $('.box-bd').children(':last').get(0).scrollIntoView(false);
}

//发送图片 change表示该文件的选择
$('#file').on('change', function () {
    //拿到上传的文件
    var file = this.files[0];
    //把文件发送的服务器，使用H5的功能fileReader,读取上传的文件
    var fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = function () {
        socket.emit('sendImage', {
            username: username,
            avatar: avatar,
            img: fr.result
        })
    }
})

//监听图片信息
socket.on('receiveImage', data => {
    //把接受到的消息显示在聊天窗口
    //判断消息是自己或别人的
    if (data.username === username) {
        //自己的消息
        $('.box-bd').append(
            ` <div class="message-box">
                <div class="my message">
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content">
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    } else {
        //别人的消息
        $('.box-bd').append(
            `<div class="message-box">
                <div class="other message">
                    <img class="avatar" src="${data.avatar}" alt=""/>
                    <div class="content">
                        <div class="nickname">${data.username}</div>
                        <div class="bubble">
                            <div class="bubble_cont">
                                <img src="${data.img}">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
        );
    }
    //等待图片加载完再滚动
    $('.box-bd img:last').on('load', function () {
        scrollIntoView();
    });

});

//发送表情
//初始化jQuery-emoji插件
$('.face').on('click', function () {
    $('#content').emoji({
        //触发表情的按钮
        button: '.face',
        showTab: false,
        animation: 'slide',
        position: 'topRight',
        icons: [{
            name: "QQ表情",
            path: "../lib/jquery-emoji/img/qq/",
            maxNum: 91,
            excludeNums: [41, 45, 54],
            file: ".gif"
        }]
    });
})