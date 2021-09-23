const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config();

// Load configuration information from system environment variables.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Create an authenticated client to access the Twilio REST API
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// render our home page
app.get('/', function (req, res, next) {
  res.render('index');
});

// handle a POST request to send a text message.
// This is sent via ajax on our home page
app.post('/message', function (req, res, next) {
  // Use the REST client to send a text message
  client.messages
    .create({
      to: req.body.to,
      from: TWILIO_PHONE_NUMBER,
      body: 'Hello, Welcome to Ellerca Health, good times and vibes await',
    })
    .then(function (message) {
      // When we get a response from Twilio, respond to the HTTP POST request
      res.send('Message is inbound!');
    });
});

// handle a POST request to make an outbound call.
// This is sent via ajax on our home page
app.post('/call', function (req, res, next) {
  // Use the REST client to send a text message
  client.calls
    .create({
      to: req.body.to,
      from: TWILIO_PHONE_NUMBER,
      url: 'http://demo.twilio.com/docs/voice.xml',
    })
    .then(function (message) {
      // When we get a response from Twilio, respond to the HTTP POST request
      res.send('Call incoming!');
    });
});

// Create a route to handle incoming SMS messages
// This is where the magic happens!
app.post('/sms', (request, response) => {
  console.log(
    `Incoming message from ${request.body.From}: ${request.body.Body}`
  );
  response.type('text/xml');
  response.send(`
<Response>
  <Message>Automatic Reply from Ellerca in the future I would reply based on your message</Message>
</Response>
`);
});

// Create a TwiML document to provide instructions for an outbound call
app.post('/hello', function (req, res, next) {
  // Create a TwiML generator
  const twiml = new twilio.twiml.VoiceResponse();
  // const twiml = new twilio.TwimlResponse();
  twiml.say('Hello there! You have successfully configured a web hook.');
  twiml.say('Hello, Welcome to Ellerca Health, good times and vibes await but only if you shout         \b\b  BAZINGA!! \b\b\b\b\ ', {
    voice: 'woman',
  });

  // Return an XML response to this request
  res.set('Content-Type', 'text/xml');
  res.send(twiml.toString());
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
