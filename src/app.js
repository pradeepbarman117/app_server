const express = require('express');
const app = express();
require('module-alias/register');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
require('./config/passport');

// ----------- Impliment Middlewares --------- //
app.use(express.json());
app.use(cors());

// Use Helmet!
app.use(helmet({
    hidePoweredBy:true,
    xssFilter: true,
    frameguard: { action: 'deny' },
}));

// testing

// ----------- End Impliment Middlewares --------- //


// Impliment Index Model
const db = require('./models/index');
// (async () => {
//     try {
//         await db.sequelize.sync();
//         console.log('Database synchronized successfully');
//     } catch (err) {
//         console.error('Error synchronizing database:', err.message);
//     }
// })();


// Impliment Index Routes
const indexRoutes = require('./routes/index.routes');
const { hidePoweredBy } = require('helmet');
const { xXssProtection } = require('helmet');
app.use('/api', indexRoutes);



module.exports = { app }