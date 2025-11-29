'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Tables', [
      {
        id: 1,
        tableNumber: '1',
        capacity: 2,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        tableNumber: '2',
        capacity: 2,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        tableNumber: '3',
        capacity: 4,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        tableNumber: '4',
        capacity: 4,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        tableNumber: '5',
        capacity: 6,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        tableNumber: '6',
        capacity: 6,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        tableNumber: '7',
        capacity: 8,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        tableNumber: '8',
        capacity: 8,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        tableNumber: '9',
        capacity: 10,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        tableNumber: '10',
        capacity: 4,
        status: 'available',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tables', null, {});
  }
};