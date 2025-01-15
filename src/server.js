const express = require('express');
const http = require('http');
const { initSocket } = require('./socket');

const { app } = require('./app');
const server = http.createServer(app);



// Initialize Socket.IO
const io = initSocket(server);

server.listen((process.env.PORT || 8080 ), () => {
  console.log('Server is running', server.address().port);
});


module.exports = io; // Export io for use in event handlers