'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Invoices', [
      {
        id: 1,
        orderId: 1,
        invoiceNumber: 'INV20250920001',
        customerName: 'Nguyễn Văn An',
        customerTaxCode: null,
        subTotal: 520000,
        taxAmount: 52000,
        totalAmount: 572000,
        paymentMethod: 'Tiền mặt',
        createdAt: new Date('2025-09-20 13:00:00'),
        updatedAt: new Date('2025-09-20 13:00:00')
      },
      {
        id: 2,
        orderId: 2,
        invoiceNumber: 'INV20250920002',
        customerName: 'Trần Thị Bình',
        customerTaxCode: null,
        subTotal: 850000,
        taxAmount: 85000,
        totalAmount: 935000,
        paymentMethod: 'Chuyển khoản',
        createdAt: new Date('2025-09-20 14:30:00'),
        updatedAt: new Date('2025-09-20 14:30:00')
      },
      {
        id: 3,
        orderId: 4,
        invoiceNumber: 'INV20250920003',
        customerName: 'Phạm Thị Dung',
        customerTaxCode: null,
        subTotal: 203500,
        taxAmount: 20350,
        totalAmount: 223850,
        paymentMethod: 'Tiền mặt',
        createdAt: new Date('2025-09-20 13:30:00'),
        updatedAt: new Date('2025-09-20 13:30:00')
      },
      {
        id: 4,
        orderId: 6,
        invoiceNumber: 'INV20250919001',
        customerName: 'Nguyễn Văn An',
        customerTaxCode: null,
        subTotal: 1200000,
        taxAmount: 120000,
        totalAmount: 1320000,
        paymentMethod: 'Chuyển khoản',
        createdAt: new Date('2025-09-19 21:00:00'),
        updatedAt: new Date('2025-09-19 21:00:00')
      },
      {
        id: 5,
        orderId: 7,
        invoiceNumber: 'INV20250919002',
        customerName: 'Vũ Thị Phương',
        customerTaxCode: null,
        subTotal: 617500,
        taxAmount: 61750,
        totalAmount: 679250,
        paymentMethod: 'Thẻ tín dụng',
        createdAt: new Date('2025-09-19 21:30:00'),
        updatedAt: new Date('2025-09-19 21:30:00')
      },
      {
        id: 6,
        orderId: 8,
        invoiceNumber: 'INV20250918001',
        customerName: 'Khách vãng lai',
        customerTaxCode: null,
        subTotal: 93500,
        taxAmount: 9350,
        totalAmount: 102850,
        paymentMethod: 'Tiền mặt',
        createdAt: new Date('2025-09-18 13:00:00'),
        updatedAt: new Date('2025-09-18 13:00:00')
      },
      {
        id: 7,
        orderId: 10,
        invoiceNumber: 'INV20250917001',
        customerName: 'Công ty TNHH ABC',
        customerTaxCode: '0123456789',
        subTotal: 2165000,
        taxAmount: 216500,
        totalAmount: 2381500,
        paymentMethod: 'Chuyển khoản',
        createdAt: new Date('2025-09-17 22:00:00'),
        updatedAt: new Date('2025-09-17 22:00:00')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Invoices', null, {});
  }
};