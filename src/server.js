// const express = require('express');
// const http = require('http');
// const { initSocket } = require('./socket');

// const { app } = require('./app');
// const server = http.createServer(app);



// // Initialize Socket.IO
// const io = initSocket(server);

// server.listen((process.env.PORT || 8080 ), () => {
//   console.log('Server is running', server.address().port);
// });


// module.exports = io; // Export io for use in event handlers




// const http = require('http');
// const { initSocket } = require('./socket');
// // const { initializeRedis } = require('./config/redis');
// const { app } = require('./app');
// const { connectRedis } = require('./config/redis');

// const server = http.createServer(app);

// // Initialize Redis
// // initializeRedis();

// // Initialize Socket.IO
// const io = initSocket(server);

// server.listen(process.env.PORT || 8080, () => {
//   console.log('Server is running', server.address().port);
// });

// module.exports = io; // Export io for use in event handlers




const express = require('express');
const http = require('http');
const { initSocket } = require('./socket');
const { app } = require('./app');
const { connectRedis } = require('./config/redis');
const { setupMasterSocket } = require('./services/socket/master/masterSocket');
const { setupMasterRequestSocket } = require('./services/socket/finance/request/masterRequestSocket');
const { setupAdminSocket } = require('./services/socket/admin/adminSocket');

const server = http.createServer(app);

// Initialize Redis and Socket
(async () => {
  try {
    // Connect Redis
    await connectRedis();
    // Initialize Socket.IO
    const io = await initSocket(server);
    
    // ------------------------ Master  ---------------------------------
    // This is for master socket adding new master updating new master
    setupMasterSocket();

    // ------------------------ Master Request Balance ---------------------------------
    setupMasterRequestSocket();

    // ------------------------ AdminBalance ---------------------------------
    
    setupAdminSocket();

    server.listen((process.env.PORT || 8080), () => {
      console.log('Server is running', server.address().port);
    });
  } catch (error) {
    console.error('Initialization failed:', error);
  }
})();

module.exports = { server };