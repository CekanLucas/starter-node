const http = require('http');
const express = require('express');
const { json } = require('body-parser');

// Set up an application to receive test events
const PORT = 8767;
const app = express();
app.use(json());
app.use(urlencoded({ extended: false }));

// Create a route to handle incoming Event Webhook messages
app.post('/events', (request, response) => {
  console.log(`Incoming Event Webhook...`);
  const data = request.body;
  console.log('Data was', data);
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

// Use a tunneling tool like ngrok to expose this URL to the public Internet!
// Create and run an HTTP server which can handle incoming requests
const server = http.createServer(app);
server.listen(PORT, () =>
  console.log(`Express server listening on localhost:${PORT}`)
);