'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Payments', [
      {
        id: 1,
        orderId: 1,
        paymentMethod: 'Tiền mặt',
        amount: 520000,
        paidAmount: 550000,
        changeAmount: 30000,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-20 13:00:00'),
        updatedAt: new Date('2025-09-20 13:00:00')
      },
      {
        id: 2,
        orderId: 2,
        paymentMethod: 'Chuyển khoản',
        amount: 850000,
        paidAmount: 850000,
        changeAmount: 0,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-20 14:30:00'),
        updatedAt: new Date('2025-09-20 14:30:00')
      },
      {
        id: 3,
        orderId: 3,
        paymentMethod: 'Thẻ tín dụng',
        amount: 445000,
        paidAmount: 445000,
        changeAmount: 0,
        paymentStatus: 'pending',
        createdAt: new Date('2025-09-20 18:15:00'),
        updatedAt: new Date('2025-09-20 18:15:00')
      },
      {
        id: 4,
        orderId: 4,
        paymentMethod: 'Tiền mặt',
        amount: 203500,
        paidAmount: 210000,
        changeAmount: 6500,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-20 13:30:00'),
        updatedAt: new Date('2025-09-20 13:30:00')
      },
      {
        id: 5,
        orderId: 5,
        paymentMethod: 'Ví điện tử MoMo',
        amount: 352000,
        paidAmount: 352000,
        changeAmount: 0,
        paymentStatus: 'pending',
        createdAt: new Date('2025-09-20 19:00:00'),
        updatedAt: new Date('2025-09-20 19:00:00')
      },
      {
        id: 6,
        orderId: 6,
        paymentMethod: 'Chuyển khoản',
        amount: 1200000,
        paidAmount: 1200000,
        changeAmount: 0,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-19 21:00:00'),
        updatedAt: new Date('2025-09-19 21:00:00')
      },
      {
        id: 7,
        orderId: 7,
        paymentMethod: 'Thẻ tín dụng',
        amount: 617500,
        paidAmount: 617500,
        changeAmount: 0,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-19 21:30:00'),
        updatedAt: new Date('2025-09-19 21:30:00')
      },
      {
        id: 8,
        orderId: 8,
        paymentMethod: 'Tiền mặt',
        amount: 93500,
        paidAmount: 100000,
        changeAmount: 6500,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-18 13:00:00'),
        updatedAt: new Date('2025-09-18 13:00:00')
      },
      {
        id: 9,
        orderId: 9,
        paymentMethod: 'Chuyển khoản',
        amount: 495000,
        paidAmount: 0,
        changeAmount: 0,
        paymentStatus: 'cancelled',
        createdAt: new Date('2025-09-18 18:30:00'),
        updatedAt: new Date('2025-09-18 18:30:00')
      },
      {
        id: 10,
        orderId: 10,
        paymentMethod: 'Chuyển khoản',
        amount: 2165000,
        paidAmount: 2165000,
        changeAmount: 0,
        paymentStatus: 'paid',
        createdAt: new Date('2025-09-17 22:00:00'),
        updatedAt: new Date('2025-09-17 22:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Payments', null, {});
  }
};
