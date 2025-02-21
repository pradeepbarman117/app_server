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
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  return transactionSchema;
};
