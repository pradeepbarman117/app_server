const router = require('express').Router();
const { createAdmin, getAdmins, loginAdmin } = require('@controllers/admin/admin.controllers');
const validateRequest = require('../../middlewares/validateRequest');
const adminSchema = require('../../validators/adminValidator');
const { authorizeRoles } = require('../../config/passport');
const passport = require('passport');
const roles = require('../../config/roles');

router.post('/auth/create', validateRequest(adminSchema), createAdmin);
router.get('/get', passport.authenticate('jwt', { session: false }), authorizeRoles([roles.ADMIN]), getAdmins);
router.post('/auth/login',loginAdmin);


// router.get('/get', passport.authenticate('jwt', { session: false }), authorizeRoles([process.env.ADMIN_CODE]), getAdmins);
// router.get(
//     '/get',
//     (req, res, next) => {
//       passport.authenticate('jwt', { session: false }, (err, user, info) => {
//         if (err || !user) {
//           // Customize the 401 Unauthorized response
//           return res.status(401).json({ message: 'Unauthorized: Invalid or missing token' });
//         }
//         req.user = user; // Attach the user to the request object
//         next();
//       })(req, res, next); // Invoke the middleware function
//     },
//     authorizeRoles([process.env.ADMIN_CODE]), // Check if the user has the required role
//     getAdmins // Proceed to the route handler
//   );
module.exports = router;  // Export the router to use in other files.