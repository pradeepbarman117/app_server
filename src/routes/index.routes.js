const express = require('express');
const router = express.Router();

const adminRoute = require('./admin/admin.routes') // Import the admin routes.
const masterRoute = require('./master/master.routes') // Import the admin routes.
const userRoute = require('./user/user.routes') // Import the admin routes.

const protectedRoute = require('./protected/protected.routes'); // Import the protected routes.

// Admin Routes
router.use(adminRoute); // Use the admin routes.



// Master Routes
router.use(masterRoute);


// User Routes
router.use(userRoute);



// Private Routes
router.use(protectedRoute); // Use the admin routes.


module.exports = router; // Export the router to use in other files.