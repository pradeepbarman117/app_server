

const { DataTypes } = require('sequelize');


module.exports = (sequelize) => {
    const requestSchema = sequelize.define('request', {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        requestId: {type: DataTypes.STRING,allowNull:false},
        requesterId: { type: DataTypes.INTEGER, allowNull: false }, // Master or User
        receiverId: { type: DataTypes.INTEGER, allowNull: false },  // Admin or Master
        amount: { type: DataTypes.FLOAT, allowNull: false },
        comments: { type: DataTypes.STRING, allowNull: true },
        status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    });
    return requestSchema
}