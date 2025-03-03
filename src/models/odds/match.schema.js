// models/match.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Match = sequelize.define('match', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    homeTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    awayTeam: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    matchDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sport: {
      type: DataTypes.STRING, // Dynamic: "cricket", "football", "baseball", etc.
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'live', 'completed'),
      defaultValue: 'upcoming',
    },
    result: {
      type: DataTypes.STRING,
      allowNull: true, // Null until match ends
    },
  }, {
    timestamps: true, // Adds createdAt and updatedAt
  });

  return Match;
};