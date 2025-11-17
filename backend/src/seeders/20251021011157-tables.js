'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Tables', [
      {
        id: 1,
        tableNumber: 'T01',
        capacity: 2,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        tableNumber: 'T02',
        capacity: 2,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        tableNumber: 'T03',
        capacity: 4,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        tableNumber: 'T04',
        capacity: 4,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        tableNumber: 'T05',
        capacity: 6,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        tableNumber: 'T06',
        capacity: 6,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        tableNumber: 'T07',
        capacity: 8,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        tableNumber: 'T08',
        capacity: 8,
        status: 'occupied',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 9,
        tableNumber: 'T09',
        capacity: 10,
        status: 'available',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 10,
        tableNumber: 'T10',
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