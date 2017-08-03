var express = require('express')
var webPush = require('web-push');
var bodyParser = require("body-parser")
var app = express();
var server = require('http').Server(app);
var port = process.env.PORT || 9992;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

let vapidKeys = webPush.generateVAPIDKeys()
console.log('vapidKeys: ', vapidKeys.publicKey)
webPush.setGCMAPIKey('AAAAuWyyIg0:APA91bEZ1kXInV6SC-QO-g7y_ryBdHeREB8PlC9keX-o6YzeEYb9VcVo9APJfW4UDfGaox5JfSx3tzHGKMCeuIlTtD_J0EkzXp5-iKkYRcOrL0f5uuzhEVGpI3JwTv3A6BDF4VfI_dRm')
// Routing
app.use("/", express.static(__dirname + '/'))
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }))

app.post('/register', (req, res) => {
  res.sendStatus(201)
})

app.post('/sendNotification', (req, res) => {
  console.log('endpoint', req.body.endpoint)
  console.log('TTL', req.body.ttl)
  console.log('keys p256dh', req.body.key)
  console.log('keys auth', req.body.authSecret)
  console.log('payload', req.body.payload)
  let pushSubscription = {
    endpoint: req.body.endpoint,
    TTL: req.body.ttl,
    keys: {
      p256dh: req.body.key,
      auth: req.body.authSecret
    }
  }
  let options = {
    gcmAPIKey: 'AAAAuWyyIg0:APA91bEZ1kXInV6SC-QO-g7y_ryBdHeREB8PlC9keX-o6YzeEYb9VcVo9APJfW4UDfGaox5JfSx3tzHGKMCeuIlTtD_J0EkzXp5-iKkYRcOrL0f5uuzhEVGpI3JwTv3A6BDF4VfI_dRm',
    vapidDetails: {
      subject: req.body.endpoint,
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    }
  }
  setTimeout(() => {
    webPush.sendNotification(pushSubscription, req.body.payload, options)
    .then(() => {
      res.sendStatus(201)
    })
    .catch((error) => {
      console.error(error)
      res.sendStatus(500)
    })
  }, 10000)
})