'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('masters', 'percent', {
      type: Sequelize.INTEGER,
      allowNull: false,
      after:'adminId'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('masters', 'percent');
  }
};