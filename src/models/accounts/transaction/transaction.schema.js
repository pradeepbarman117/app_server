const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const transactionSchema = sequelize.define("transaction", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    transactionId: { type: DataTypes.STRING, allowNull: false },
    senderId: { type: DataTypes.INTEGER, allowNull: false }, // Admin or Master
    receiverId: { type: DataTypes.INTEGER, allowNull: false }, // Master or User
    amount: { type: DataTypes.FLOAT, allowNull: false },
    comments: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM("completed", "failed"),
      defaultValue: "completed",
    },
    masterId: {
      type: DataTypes.INTEGER, allowNull: true, references: {
        model: 'masters',
        key: 'id',
      },
      index:true,
    },

    adminId: {
      type: DataTypes.INTEGER, allowNull: true, references: {
        model: 'admins',
        key: 'id',
      },
      index:true,
    },

    userId: {
      type: DataTypes.INTEGER, allowNull: true, references: {
        model: 'users',
        key: 'id',
      },
      index:true,
    },

    requestId: {
      type: DataTypes.INTEGER, allowNull: true, references: {
        model: 'requests',
        key: 'id',
      },
      index:true,
    },
    
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  return transactionSchema;
};
