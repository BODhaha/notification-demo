self.addEventListener('push', function(event) {
    var payload = event.data ? event.data.text() : 'no payload';
    console.log(payload)
    const title = '111111';
    const options = {
        body: payload,
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };

    event.waitUntil(self.registration.showNotification(title, options));
})