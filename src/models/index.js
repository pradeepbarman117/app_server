// 'use strict';

// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const process = require('process');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require(__dirname + '/../config/config.json')[env];
// const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// fs
//   .readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 &&
//       file !== basename &&
//       file.slice(-3) === '.js' &&
//       file.indexOf('.test.js') === -1
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;



'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json');
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.development);
}

// Recursive function to load models from all subdirectories
const loadModels = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      loadModels(filePath); // Recursively read subdirectories
    } else if (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    ) {
      const model = require(filePath)(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }
  });
};

// Start loading models from the current directory
loadModels(__dirname);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;



////////  Relationship between models ////////////
// Define associations between admin, master, and user models

// Admin to Master
db.admin.hasMany(db.master, { foreignKey: 'adminId', as: 'masters' });
db.master.belongsTo(db.admin, { foreignKey: 'adminId', as: 'admin' });
// Admin to User relationship
db.admin.hasMany(db.user, { foreignKey: 'adminId', as: 'adminUsers' });
db.user.belongsTo(db.admin, { foreignKey: 'adminId', as: 'admin' });
// Master to User relationship
db.master.hasMany(db.user, { foreignKey: 'masterId', as: 'masterUsers' });
db.user.belongsTo(db.master, { foreignKey: 'masterId', as: 'master' });


// Define associations between Resquest and Transactions => Master Admin and User 

// // Request to Master
db.request.belongsTo(db.master, {foreignKey:'masterId', as:'masterList'});
db.master.hasMany(db.request, {foreignKey:'masterId', as:'requestList'});

// // // Request to Admin
// db.request.hasMany(db.admin, {foreignKey:'adminId', as:'adminList'});
// db.admin.belongsTo(db.request, {foreignKey:'adminId', as:'requestList'});

// // Request to User
// db.request.hasMany(db.user, {foreignKey:'userId', as:'userList'});
// db.user.belongsTo(db.request, {foreignKey:'userId', as:'requestList'});

// // Request to Transaction
db.request.hasMany(db.transaction, {foreignKey:'requestId', as:'transactionList'});
db.transaction.belongsTo(db.request, {foreignKey:'requestId', as:'requestList'});

// // Transaction to Admin
// db.transaction.hasMany(db.admin, {foreignKey:'adminId', as:'adminList'});
// db.admin.belongsTo(db.transaction, {foreignKey:'adminId', as:'transactionList'});
// // Transaction to User
// db.transaction.hasMany(db.user, {foreignKey:'userId', as:'userList'});
// db.user.belongsTo(db.transaction, {foreignKey:'userId', as:'transactionList'});
// // Transaction to Master
// db.transaction.hasMany(db.master, {foreignKey:'masterId', as:'masterList'});
// db.master.belongsTo(db.transaction, {foreignKey:'masterId', as:'transactionList'});



module.exports = db;