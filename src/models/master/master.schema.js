
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const masterSchema = sequelize.define('master', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        uuid:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            unique:true,
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
            type:DataTypes.STRING,
            defaultValue:'4csff-b005-',
            allowNull: false,
            validate: {
                is: /^4csff-b005-$/,
            },
        },
        passcode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        adminId: { // Add the foreign key here
            type: DataTypes.INTEGER,
            allowNull: false, // or true if optional
            references: {
                model: 'admins', // Name of the target table
                key: 'id', // Key in the target table
            },
        },
        percent:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        blacklist: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
    return masterSchema;
}