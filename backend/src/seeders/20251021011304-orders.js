'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Orders', [
      // {
      //   id: 1,
      //   orderNumber: 'ORD20250920001',
      //   customerId: 1,
      //   tableId: 2,
      //   subTotal: 520000,
      //   serviceCharge: 52000,
      //   discountAmount: 52000,
      //   totalAmount: 520000,
      //   orderStatus: 'completed',
      //   customerNotes: 'Không hành',
      //   createdAt: new Date('2025-09-20 11:30:00'),
      //   updatedAt: new Date('2025-09-20 13:00:00')
      // },
      // {
      //   id: 2,
      //   orderNumber: 'ORD20250920002',
      //   customerId: 2,
      //   tableId: 6,
      //   subTotal: 850000,
      //   serviceCharge: 85000,
      //   discountAmount: 85000,
      //   totalAmount: 850000,
      //   orderStatus: 'completed',
      //   customerNotes: 'Ít cay',
      //   createdAt: new Date('2025-09-20 12:00:00'),
      //   updatedAt: new Date('2025-09-20 14:30:00')
      // },
      // {
      //   id: 3,
      //   orderNumber: 'ORD20250920003',
      //   customerId: 3,
      //   tableId: 4,
      //   subTotal: 450000,
      //   serviceCharge: 45000,
      //   discountAmount: 50000,
      //   totalAmount: 445000,
      //   orderStatus: 'confirmed',
      //   customerNotes: null,
      //   createdAt: new Date('2025-09-20 18:00:00'),
      //   updatedAt: new Date('2025-09-20 18:15:00')
      // },
      // {
      //   id: 4,
      //   orderNumber: 'ORD20250920004',
      //   customerId: 4,
      //   tableId: 1,
      //   subTotal: 185000,
      //   serviceCharge: 18500,
      //   discountAmount: 0,
      //   totalAmount: 203500,
      //   orderStatus: 'completed',
      //   customerNotes: 'Giao nhanh',
      //   createdAt: new Date('2025-09-20 12:30:00'),
      //   updatedAt: new Date('2025-09-20 13:30:00')
      // },
      // {
      //   id: 5,
      //   orderNumber: 'ORD20250920005',
      //   customerId: 5,
      //   tableId: 3,
      //   subTotal: 320000,
      //   serviceCharge: 32000,
      //   discountAmount: 0,
      //   totalAmount: 352000,
      //   orderStatus: 'pending',
      //   customerNotes: 'Cho thêm tương ớt',
      //   createdAt: new Date('2025-09-20 19:00:00'),
      //   updatedAt: new Date('2025-09-20 19:00:00')
      // },
      // {
      //   id: 6,
      //   orderNumber: 'ORD20250919001',
      //   customerId: 1,
      //   tableId: 5,
      //   subTotal: 1200000,
      //   serviceCharge: 120000,
      //   discountAmount: 120000,
      //   totalAmount: 1200000,
      //   orderStatus: 'completed',
      //   customerNotes: 'Tiệc sinh nhật',
      //   createdAt: new Date('2025-09-19 18:00:00'),
      //   updatedAt: new Date('2025-09-19 21:00:00')
      // },
      // {
      //   id: 7,
      //   orderNumber: 'ORD20250919002',
      //   customerId: 6,
      //   tableId: 7,
      //   subTotal: 650000,
      //   serviceCharge: 65000,
      //   discountAmount: 97500,
      //   totalAmount: 617500,
      //   orderStatus: 'completed',
      //   customerNotes: null,
      //   createdAt: new Date('2025-09-19 19:30:00'),
      //   updatedAt: new Date('2025-09-19 21:30:00')
      // },
      // {
      //   id: 8,
      //   orderNumber: 'ORD20250918001',
      //   customerId: 7,
      //   tableId: 2,
      //   subTotal: 85000,
      //   serviceCharge: 8500,
      //   discountAmount: 0,
      //   totalAmount: 93500,
      //   orderStatus: 'completed',
      //   customerNotes: null,
      //   createdAt: new Date('2025-09-18 12:00:00'),
      //   updatedAt: new Date('2025-09-18 13:00:00')
      // },
      // {
      //   id: 9,
      //   orderNumber: 'ORD20250918002',
      //   customerId: 2,
      //   tableId: 6,
      //   subTotal: 450000,
      //   serviceCharge: 45000,
      //   discountAmount: 0,
      //   totalAmount: 495000,
      //   orderStatus: 'cancelled',
      //   customerNotes: 'Hủy do có việc đột xuất',
      //   createdAt: new Date('2025-09-18 18:00:00'),
      //   updatedAt: new Date('2025-09-18 18:30:00')
      // },
      // {
      //   id: 10,
      //   orderNumber: 'ORD20250917001',
      //   customerId: 4,
      //   tableId: 9,
      //   subTotal: 2150000,
      //   serviceCharge: 215000,
      //   discountAmount: 200000,
      //   totalAmount: 2165000,
      //   orderStatus: 'completed',
      //   customerNotes: 'Tiệc công ty',
      //   createdAt: new Date('2025-09-17 19:00:00'),
      //   updatedAt: new Date('2025-09-17 22:00:00')
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Orders', null, {});
  }
};