var endpoint
var key
var authSecret
var swRegistration
var $enableToPush = $('#enable-to-push')
var $text = $('#text')
var $send = $('#send')

$enableToPush.click(function () {
    notifyMe()
})

function notifyMe () {
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification')
    } else if (Notification.permission === 'granted') {
        // granted

    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            if (permission === 'granted') {
                // granted
                registerSw()
            }
        })
    }
}
function sendSubscription () {
    return swRegistration.pushManager.getSubscription()
    .then(function (subscription) {
        if (subscription) {
            return subscription
        }

        return swRegistration.pushManager.subscribe({userVisibleOnly: true})
    })
    // swRegistration.pushManager.subscribe({
    //     userVisibleOnly: true
    // })
    // .then(function (subscription) {
    //     console.log('User is subscribed')
    //     console.log('subscription: ', subscription)
    // })
    // .catch(function (err) {
    //     console.log('Failed to subscribe the user: ', err)
    // })
}

function registerSw () {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service worker and Push is supported')
        navigator.serviceWorker.register('sw.js')
        .then(function (registration) {
            console.log('Service Worker is registered', registration)
            swRegistration = registration
            $enableToPush.attr("disabled", true)
            return registration.pushManager.getSubscription()
            .then(function (subscription) {
                if (subscription) {
                    return subscription
                }

                return registration.pushManager.subscribe({userVisibleOnly: true})
            })
        })
        .then(function (subscription) {
            console.log('subscription1: ', subscription.getKey)
            var rawKey = subscription.getKey ? subscription.getKey('p256dh') : ''
            key = rawKey ? 
                  btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) : ''
            var rawAuthSecret = subscription.getKey ? subscription.getKey('auth') : ''
            authSecret = rawAuthSecret ? btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) : ''

            endpoint = subscription.endpoint
            console.log('1 endpoint: ', subscription.endpoint)
            console.log('1 authSecret: ', authSecret)
            console.log('1 key: ', key)

            $.ajax({
                type: 'POST',
                url: '/register',
                data: {
                    endpoint: subscription.endpoint,
                    key: key,
                    authSecret: authSecret
                },
                success: function () {
                    console.log('register success')
                }
            });
            // fetch('./register', {
            //     methods: 'post',
            //     headers: {
            //         'Content-type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //         endpoint: subscription.endpoint,
            //         key: key,
            //         authSecret: authSecret
            //     })
            // })
        })
        .catch(function (error) {
            console.error('Service Worker Error', error)
        })
    } else {
        console.error('Push messaging is not supported')
    }
}


$send.click(function () {
    let payload = $text.val()
    let ttl = 0
    console.log('endpoint: ', endpoint)
    console.log('key: ', key)
    console.log('authSecret: ', authSecret)
    console.log('payload: ', payload)
    console.log('ttl: ', ttl)
    $.ajax({
        type: 'POST',
        url: '/sendNotification',
        data:{
            endpoint: endpoint,
            key: key,
            authSecret: authSecret,
            payload: payload,
            delay: 0,
            ttl: ttl,
        },
        success: function () {
            console.log('send success')
        }
    });
//     fetch('./sendNotification', {
//     method: 'post',
//     headers: {
//       'Content-type': 'application/json'
//     },
//     body: JSON.stringify({
//       endpoint: endpoint,
//       key: key,
//       authSecret: authSecret,
//       payload: payload,
//       delay: 0,
//       ttl: ttl,
//     }),
//   });

})