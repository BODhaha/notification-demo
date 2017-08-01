$(function () {
    var $window = $(window)
    var $usernameInput = $('.usernameInput')
    var $messages = $('.messages')
    var $inputMessage = $('.inputMessage')

    var $loginPage = $('.login.page')
    var $chatPage = $('.chat.page')

    var socket = io();

    var username

    $window.keydown(function (event) {
        console.log(event.which)
        if (event.which === 13) {
            setUsername()
        }
    })

    function setUsername () {
        username = $usernameInput.val()
        if (username) {
            $loginPage.fadeOut()
            $chatPage.show()
            $usernameInput.val('')

            socket.emit('add user', username)
        }
    }

    // 被通知 有新用户来了
    socket.on('user joined', function (data) {
        debugger
        console.log('client data: ', data)
    })
})
