'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Phamquan2004@', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: 'admin',
        phone: '0901234567',
        email: 'admin@restaurant.com',
        password: hashedPassword,
        roleId: 1,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'staff',
        phone: '0902345678',
        email: 'staff1@restaurant.com',
        password: hashedPassword,
        roleId: 4,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        username: 'staff',
        phone: '0903456789',
        email: 'waiter2@restaurant.com',
        password: hashedPassword,
        roleId: 4,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        username: 'customer',
        phone: '0904567890',
        email: 'customer1@restaurant.com',
        password: hashedPassword,
        roleId: 5,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        username: 'customer',
        phone: '0905678901',
        email: 'customer2@restaurant.com',
        password: hashedPassword,
        roleId: 5,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        username: 'customer',
        phone: '0906789012',
        email: 'customer3@restaurant.com',
        password: hashedPassword,
        roleId: 5,
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};