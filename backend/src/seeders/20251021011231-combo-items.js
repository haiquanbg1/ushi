'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ComboItems', [
      // Combo 1: Ăn Trưa Tiết Kiệm
      // {
      //   id: 1,
      //   comboId: 1,
      //   itemId: 3, // Cơm sườn
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 2,
      //   comboId: 1,
      //   itemId: 15, // Nước ngọt
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 3,
      //   comboId: 1,
      //   itemId: 18, // Chè ba màu
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },

      // // Combo 2: Gia Đình
      // {
      //   id: 4,
      //   comboId: 2,
      //   itemId: 6, // Lẩu thái
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 5,
      //   comboId: 2,
      //   itemId: 15, // Nước ngọt
      //   quantity: 4,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 6,
      //   comboId: 2,
      //   itemId: 12, // Salad rau
      //   quantity: 1,
      //   isRequired: false,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },

      // // Combo 3: Couple
      // {
      //   id: 7,
      //   comboId: 3,
      //   itemId: 1, // Gỏi cuốn
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 8,
      //   comboId: 3,
      //   itemId: 3, // Cơm sườn
      //   quantity: 2,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 9,
      //   comboId: 3,
      //   itemId: 15, // Nước ngọt
      //   quantity: 2,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 10,
      //   comboId: 3,
      //   itemId: 18, // Chè
      //   quantity: 2,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },

      // // Combo 4: Sinh Nhật
      // {
      //   id: 11,
      //   comboId: 4,
      //   itemId: 7, // Lẩu bò
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 12,
      //   comboId: 4,
      //   itemId: 9, // Gà nướng
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 13,
      //   comboId: 4,
      //   itemId: 13, // Salad gà
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 14,
      //   comboId: 4,
      //   itemId: 15, // Nước ngọt
      //   quantity: 4,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },

      // // Combo 5: BBQ Hải Sản
      // {
      //   id: 15,
      //   comboId: 5,
      //   itemId: 8, // Sườn bò Mỹ
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 16,
      //   comboId: 5,
      //   itemId: 10, // Tôm hùm
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 17,
      //   comboId: 5,
      //   itemId: 11, // Cua rang
      //   quantity: 1,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 18,
      //   comboId: 5,
      //   itemId: 12, // Salad rau
      //   quantity: 2,
      //   isRequired: true,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 19,
      //   comboId: 5,
      //   itemId: 19, // Kem dừa
      //   quantity: 2,
      //   isRequired: false,
      //   isDefault: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ComboItems', null, {});
  }
};