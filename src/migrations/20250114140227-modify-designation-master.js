module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('masters', 'designation', {
      type: Sequelize.STRING,
      defaultValue: '4csff-b005',
      allowNull: false,
      validate: {
        is: /^4csff-b005$/,
      },
    });

    // Update existing master records

    await queryInterface.bulkUpdate('masters', {
      designation: '4csff-b005',
    }, {});

  },


  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('masters', 'designation', {
      type: Sequelize.ENUM,
      allowNull:false,
      // Add previous enum values if needed
    });
  },
};