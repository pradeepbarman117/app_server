// models/odds.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Odds = sequelize.define('odds', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    matchId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'matches',
        key: 'id',
      },
    },
    homeTeamOdds: {
      type: DataTypes.DECIMAL(10, 2), // e.g., 1.85
      allowNull: false,
    },
    awayTeamOdds: {
      type: DataTypes.DECIMAL(10, 2), // e.g., 2.10
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  return Odds;
};