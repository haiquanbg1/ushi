'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Combos', [
      // {
      //   id: 1,
      //   name: 'Combo Ăn Trưa Tiết Kiệm',
      //   description: 'Gồm cơm sườn + nước ngọt + chè tráng miệng',
      //   price: 85000,
      //   image: 'combo-trua.jpg',
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 2,
      //   name: 'Combo Gia Đình',
      //   description: 'Lẩu thái hải sản + 2 phần bún + rau + nước ngọt (4 người)',
      //   price: 450000,
      //   image: 'combo-gia-dinh.jpg',
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 3,
      //   name: 'Combo Couple',
      //   description: 'Gỏi cuốn + Cơm sườn (2 phần) + 2 nước ngọt + 2 tráng miệng',
      //   price: 185000,
      //   image: 'combo-couple.jpg',
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 4,
      //   name: 'Combo Sinh Nhật',
      //   description: 'Lẩu bò + Gà nướng + Salad + 4 nước ngọt + Bánh sinh nhật',
      //   price: 650000,
      //   image: 'combo-sinhnhat.jpg',
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 5,
      //   name: 'Combo BBQ Hải Sản',
      //   description: 'Sườn bò Mỹ + Tôm hùm + Cua rang me + Rau + Tráng miệng',
      //   price: 1200000,
      //   image: 'combo-bbq.jpg',
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Combos', null, {});
  }
};
