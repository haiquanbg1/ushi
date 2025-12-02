'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('CustomerPromotions', [
      // {
      //   id: 1,
      //   customerId: 1,
      //   promotionId: 1,
      //   usedAt: new Date('2025-09-20 13:00:00'),
      //   orderId: 1,
      //   discountAmount: 52000,
      //   status: 'used',
      //   createdAt: new Date('2025-09-20 13:00:00'),
      //   updatedAt: new Date('2025-09-20 13:00:00')
      // },
      // {
      //   id: 2,
      //   customerId: 2,
      //   promotionId: 1,
      //   usedAt: new Date('2025-09-20 14:30:00'),
      //   orderId: 2,
      //   discountAmount: 85000,
      //   status: 'used',
      //   createdAt: new Date('2025-09-20 14:30:00'),
      //   updatedAt: new Date('2025-09-20 14:30:00')
      // },
      // {
      //   id: 3,
      //   customerId: 3,
      //   promotionId: 2,
      //   usedAt: new Date('2025-09-20 18:15:00'),
      //   orderId: 3,
      //   discountAmount: 50000,
      //   status: 'used',
      //   createdAt: new Date('2025-09-20 18:15:00'),
      //   updatedAt: new Date('2025-09-20 18:15:00')
      // },
      // {
      //   id: 4,
      //   customerId: 1,
      //   promotionId: 5,
      //   usedAt: new Date('2025-09-19 21:00:00'),
      //   orderId: 6,
      //   discountAmount: 100000,
      //   status: 'used',
      //   createdAt: new Date('2025-09-19 21:00:00'),
      //   updatedAt: new Date('2025-09-19 21:00:00')
      // },
      // {
      //   id: 5,
      //   customerId: 6,
      //   promotionId: 6,
      //   usedAt: new Date('2025-09-19 21:30:00'),
      //   orderId: 7,
      //   discountAmount: 162500,
      //   status: 'used',
      //   createdAt: new Date('2025-09-19 21:30:00'),
      //   updatedAt: new Date('2025-09-19 21:30:00')
      // },
      // {
      //   id: 6,
      //   customerId: 4,
      //   promotionId: 7,
      //   usedAt: new Date('2025-09-17 22:00:00'),
      //   orderId: 10,
      //   discountAmount: 200000,
      //   status: 'used',
      //   createdAt: new Date('2025-09-17 22:00:00'),
      //   updatedAt: new Date('2025-09-17 22:00:00')
      // },
      // {
      //   id: 7,
      //   customerId: 1,
      //   promotionId: 3,
      //   usedAt: null,
      //   orderId: null,
      //   discountAmount: null,
      //   status: 'available',
      //   createdAt: new Date('2025-09-20 10:00:00'),
      //   updatedAt: new Date('2025-09-20 10:00:00')
      // },
      // {
      //   id: 8,
      //   customerId: 2,
      //   promotionId: 3,
      //   usedAt: null,
      //   orderId: null,
      //   discountAmount: null,
      //   status: 'available',
      //   createdAt: new Date('2025-09-20 10:00:00'),
      //   updatedAt: new Date('2025-09-20 10:00:00')
      // },
      // {
      //   id: 9,
      //   customerId: 4,
      //   promotionId: 5,
      //   usedAt: null,
      //   orderId: null,
      //   discountAmount: null,
      //   status: 'available',
      //   createdAt: new Date('2025-09-20 10:00:00'),
      //   updatedAt: new Date('2025-09-20 10:00:00')
      // },
      // {
      //   id: 10,
      //   customerId: 5,
      //   promotionId: 2,
      //   usedAt: null,
      //   orderId: null,
      //   discountAmount: null,
      //   status: 'expired',
      //   createdAt: new Date('2025-08-01 10:00:00'),
      //   updatedAt: new Date('2025-09-01 00:00:00')
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CustomerPromotions', null, {});
  }
};