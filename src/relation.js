// // Define relationships for the Admin model
// function defineAdminRelationships(db) {
//     db.admin.hasMany(db.master, {
//         foreignKey: 'adminId',
//         as: 'masters'
//     });

//     db.admin.hasMany(db.user, {
//         foreignKey: 'adminId',
//         as: 'adminUsers'
//     });
// }

// // Define relationships for the Master model
// function defineMasterRelationships(db) {
//     db.master.belongsTo(db.admin, {
//         foreignKey: 'adminId',
//         as: 'admin'
//     });

//     db.master.hasMany(db.user, {
//         foreignKey: 'masterId',
//         as: 'masterUsers'
//     });
// }

// // Define relationships for the User model
// function defineUserRelationships(db) {
//     db.user.belongsTo(db.admin, {
//         foreignKey: 'adminId',
//         as: 'admin'
//     });

//     db.user.belongsTo(db.master, {
//         foreignKey: 'masterId',
//         as: 'parent'
//     });
// }

// // Function to define all relationships
// function defineRelationships(db) {
//     defineAdminRelationships(db);
//     defineMasterRelationships(db);
//     defineUserRelationships(db);
// }

// // Call the function to define relationships
// defineRelationships(db);