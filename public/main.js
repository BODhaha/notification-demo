var endpoint
var key
var authSecret
var swRegistration
var $enableToPush = $('#enable-to-push')
var $text = $('#text')
var $send = $('#send')
var vapidPublicKey = 'BMoCRef_vaEDb5oe6BAxYBSHkf5RIk6adMwY-FCMhsMd9nhioDn4xSrrFZhuie2IHbj87SgnuSemeLTVEd1IzW8';
var convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

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

                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                })
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
        })
        .catch(function (error) {
            console.error('Service Worker Error', error)
        })
    } else {
        console.error('Push messaging is not supported')
    }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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