const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,
        },
        userId:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        passcode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        designation: {
            type: DataTypes.STRING,
            defaultValue: 'd26ced-80ede',
            allowNull: false,
            validate: {
                is: /^d26ced-80ede$/,
            },
        },
        masterId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'masters',
                key: 'id',
            },
            index: true,
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'admins',
                key: 'id',
            },
            index: true,
        },
        coin: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        blacklist: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    }, {
        timestamps: true,
        paranoid: true,
    });
    return User;
}