const express = require('express');
const app = express();
require('module-alias/register');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
require('./config/passport');
const swaggerSpec = require('./swagger/swagger');
const swaggerUi = require('swagger-ui-express');

// ----------- Impliment Middlewares --------- //
app.use(express.json());
app.use(cors());

// Use Helmet!
app.use(helmet({
    hidePoweredBy:true,
    xssFilter: true,
    frameguard: { action: 'deny' },
}));



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


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
const oddsRoutes = require('./routes/odds.routes');
const financeRoute = require('./routes/finance.routes');

app.use('/api', indexRoutes);
app.use('/api/odds', oddsRoutes);
app.use('/api/finance', financeRoute);



module.exports = { app }