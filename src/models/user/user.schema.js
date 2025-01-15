const {  DataTypes } = require('sequelize')

module.exports = (sequelize) => {
    const userScheama = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,  // Email validation
            },
        },
        password: {
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
        coin: {
            type: DataTypes.INTEGER,
            allowNull: false,
            default: 0,
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
        }
    },
        {
            timestamps: true,
        },
    );
    return userScheama;
}