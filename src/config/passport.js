const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require('../models/index');
const User = db.user;
const Admin = db.admin;
const Master = db.master;
const passport = require('passport');
const CryptoJS = require('crypto-js');
const roles = require('./roles');
const { where } = require('sequelize');


// JWT options for extracting token and validating it
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from the Authorization header
    secretOrKey: process.env.JWT_SECRET, // Secret key to verify the token
};



const getUserByRole = async (designation, uuid) => {

    switch (designation) {
        case process.env.USER_CODE:
            return await User.findOne({ where: { uuid } });
        case process.env.ADMIN_CODE:
            return await Admin.findOne({ where: { uuid } });
        case process.env.MASTER_CODE:
            return await Master.findOne({ where: { uuid } });
        default:
            return null;
    }
};

// JWT Strategy for Passport
passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // Decrypt the payload
            const decryptedPayloadBytes = CryptoJS.AES.decrypt(jwt_payload.data, process.env.JWT_ENCRYPTION_KEY);
            const decryptedPayload = JSON.parse(decryptedPayloadBytes.toString(CryptoJS.enc.Utf8));
            // let testData = await Master.findOne({where:{uuid:decryptedPayload.uuid}});
            const user = await getUserByRole(decryptedPayload.designation, decryptedPayload.uuid);
            
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            const currentUser = {
                id: user.id,
                designation: user.designation,
                uuid: user.uuid,
                name:user.name
            }
            return done(null, currentUser); // If user exists, return user object
        } catch (err) {
            return done(err, false);
        }
    })
);

// Middleware for role-based access control

const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.user) {
                return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
            }
            
            // Access the user's role (designation) from the user object
            const userRole = req.user.designation;
            
            // Dynamically authorize based on the user's role
            if (!userRole || !allowedRoles.includes(userRole) ) {
                return res.status(403).json({ message: 'Access Denied: Role not found' });
            }

            // Proceed to the next middleware or route handler
            next();
        } catch (error) {
            // Handle unexpected errors
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};


module.exports = {
    passport,
    authorizeRoles,
};



// const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
// const db = require('../models/index');
// const User = db.user;
// const Admin = db.admin;
// const Master = db.master;
// const passport = require('passport');
// const CryptoJS = require('crypto-js');

// // JWT options for extracting token and validating it
// const opts = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from the Authorization header
//     secretOrKey: process.env.JWT_SECRET, // Secret key to verify the token
//     passReqToCallback: true,
    
// };

// // Fetch user by role
// const getUserByRole = async (designation, uuid) => {
//     switch (designation) {
//         case process.env.USER_CODE:
//             return await User.findOne({ where: { uuid } });
//         case process.env.ADMIN_CODE:
//             return await Admin.findOne({ where: { uuid } });
//         case process.env.MASTER_CODE:
//             return await Master.findOne({ where: { uuid } });
//         default:
//             return null;
//     }
// };

// // JWT Strategy for Passport
// passport.use(
//     new JwtStrategy(opts, async (req,jwt_payload, done) => {
//         try {
//             // Decrypt the payload
//             const decryptedPayloadBytes = CryptoJS.AES.decrypt(jwt_payload.data, process.env.JWT_ENCRYPTION_KEY);
//             const decryptedPayload = JSON.parse(decryptedPayloadBytes.toString(CryptoJS.enc.Utf8));

//             // Check if user is already cached in the request
//             if (req.user && req.user.uuid === decryptedPayload.uuid) {
//                 return done(null, req.user); // Use cached user
//             }

//             // Fetch user based on role if not cached
//             const user = await getUserByRole(decryptedPayload.designation, decryptedPayload.uuid);

//             if (!user) {
//                 return done(null, false, { message: 'User not found' });
//             }

//             // Attach the user object to req for caching in subsequent middleware
//             req.user = user;
//             return done(null, user); // Return user object
//         } catch (err) {
//             return done(err, false);
//         }
//     })
// );

// // Middleware for role-based access control
// const authorizeRoles = (allowedRoles) => {
//     return (req, res, next) => {
//         try {
//             // Check if user is authenticated
//             if (!req.user) {
//                 return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
//             }

//             // Access the user's role (designation) from the user object
//             const userRole = req.user.designation;
//             console.log(userRole, 'userRoles');

//             // Dynamically authorize based on the user's role
//             if (!userRole || !allowedRoles.includes(userRole)) {
//                 return res.status(403).json({ message: 'Access Denied: Role not found' });
//             }

//             // Proceed to the next middleware or route handler
//             next();
//         } catch (error) {
//             // Handle unexpected errors
//             res.status(500).json({ message: 'Internal Server Error' });
//         }
//     };
// };

// module.exports = {
//     passport,
//     authorizeRoles,
// };
