// models/bet.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bet = sequelize.define('bet', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // Assumes a users table
        key: 'id',
      },
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id',
      },
    },
    oddsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'odds',
        key: 'id',
      },
    },
    betType: {
      type: DataTypes.ENUM('home', 'away'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2), // e.g., 100.00
      allowNull: false,
    },
    potentialPayout: {
      type: DataTypes.DECIMAL(10, 2), // e.g., 185.00
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'won', 'lost'),
      defaultValue: 'pending',
    },
  }, {
    timestamps: true,
  });

  return Bet;
};