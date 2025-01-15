
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const adminSchema = sequelize.define('admin', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        uuid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            unique: true,  // Ensure UUID is unique
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true,  // Email validation
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        designation: {
            type: DataTypes.ENUM('84d3eb14-bda1','4csff-b005','d26ced-80ede'),
            allowNull: false,
        },
        passcode:{
            type: DataTypes.STRING,
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
        }
    );
    return adminSchema;
}