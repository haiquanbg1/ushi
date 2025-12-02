'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('OrderDetails', [
      // Order 1
      // {
      //   id: 1,
      //   orderId: 1,
      //   itemId: 6,
      //   comboId: null,
      //   quantity: 1,
      //   unitPrice: 350000,
      //   totalPrice: 350000,
      //   specialInstructions: 'Không hành',
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 2,
      //   orderId: 1,
      //   itemId: 12,
      //   comboId: null,
      //   quantity: 2,
      //   unitPrice: 45000,
      //   totalPrice: 90000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 3,
      //   orderId: 1,
      //   itemId: 15,
      //   comboId: null,
      //   quantity: 4,
      //   unitPrice: 15000,
      //   totalPrice: 60000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 4,
      //   orderId: 1,
      //   itemId: 18,
      //   comboId: null,
      //   quantity: 2,
      //   unitPrice: 25000,
      //   totalPrice: 50000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'menu_item'
      // },

      // // Order 2
      // {
      //   id: 5,
      //   orderId: 2,
      //   itemId: 10,
      //   comboId: null,
      //   quantity: 1,
      //   unitPrice: 850000,
      //   totalPrice: 850000,
      //   specialInstructions: 'Hấp vừa chín',
      //   status: 'served',
      //   itemType: 'menu_item'
      // },

      // // Order 3 - Combo 2
      // {
      //   id: 6,
      //   orderId: 3,
      //   itemId: null,
      //   comboId: 2,
      //   quantity: 1,
      //   unitPrice: 450000,
      //   totalPrice: 450000,
      //   specialInstructions: 'Ít cay',
      //   status: 'preparing',
      //   itemType: 'combo'
      // },

      // // Order 4 - Combo 3
      // {
      //   id: 7,
      //   orderId: 4,
      //   itemId: null,
      //   comboId: 3,
      //   quantity: 1,
      //   unitPrice: 185000,
      //   totalPrice: 185000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'combo'
      // },

      // // Order 5
      // {
      //   id: 8,
      //   orderId: 5,
      //   itemId: 7,
      //   comboId: null,
      //   quantity: 1,
      //   unitPrice: 320000,
      //   totalPrice: 320000,
      //   specialInstructions: 'Cho thêm tương ớt',
      //   status: 'pending',
      //   itemType: 'menu_item'
      // },

      // // Order 6 - Combo 5
      // {
      //   id: 9,
      //   orderId: 6,
      //   itemId: null,
      //   comboId: 5,
      //   quantity: 1,
      //   unitPrice: 1200000,
      //   totalPrice: 1200000,
      //   specialInstructions: 'Tiệc sinh nhật, chuẩn bị đẹp',
      //   status: 'served',
      //   itemType: 'combo'
      // },

      // // Order 7 - Combo 4
      // {
      //   id: 10,
      //   orderId: 7,
      //   itemId: null,
      //   comboId: 4,
      //   quantity: 1,
      //   unitPrice: 650000,
      //   totalPrice: 650000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'combo'
      // },

      // // Order 8 - Combo 1
      // {
      //   id: 11,
      //   orderId: 8,
      //   itemId: null,
      //   comboId: 1,
      //   quantity: 1,
      //   unitPrice: 85000,
      //   totalPrice: 85000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'combo'
      // },

      // // Order 9 - Cancelled
      // {
      //   id: 12,
      //   orderId: 9,
      //   itemId: null,
      //   comboId: 2,
      //   quantity: 1,
      //   unitPrice: 450000,
      //   totalPrice: 450000,
      //   specialInstructions: null,
      //   status: 'cancelled',
      //   itemType: 'combo'
      // },

      // // Order 10 - Large party
      // {
      //   id: 13,
      //   orderId: 10,
      //   itemId: 8,
      //   comboId: null,
      //   quantity: 3,
      //   unitPrice: 250000,
      //   totalPrice: 750000,
      //   specialInstructions: 'Chín vừa',
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 14,
      //   orderId: 10,
      //   itemId: 9,
      //   comboId: null,
      //   quantity: 2,
      //   unitPrice: 180000,
      //   totalPrice: 360000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 15,
      //   orderId: 10,
      //   itemId: 11,
      //   comboId: null,
      //   quantity: 2,
      //   unitPrice: 380000,
      //   totalPrice: 760000,
      //   specialInstructions: 'Rang khô',
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 16,
      //   orderId: 10,
      //   itemId: 13,
      //   comboId: null,
      //   quantity: 3,
      //   unitPrice: 65000,
      //   totalPrice: 195000,
      //   specialInstructions: null,
      //   status: 'served',
      //   itemType: 'menu_item'
      // },
      // {
      //   id: 17,
      //   orderId: 10,
      //   itemId: 15,
      //   comboId: null,
      //   quantity: 10,
      //   unitPrice: 15000,
      //   totalPrice: 150000,
      //   specialInstructions: 'Coca và Sprite',
      //   status: 'served',
      //   itemType: 'menu_item'
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('OrderDetails', null, {});
  }
};