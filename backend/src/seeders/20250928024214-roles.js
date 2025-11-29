'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        roleName: 'Admin',
        description: 'Quản trị viên hệ thống, có quyền truy cập và quản lý toàn bộ hệ thống',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'Staff',
        description: 'Nhân viên phục vụ, có quyền xử lý đơn hàng và phục vụ khách hàng',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: 'Customer',
        description: 'Khách hàng, có quyền đặt món và xem thông tin cá nhân',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};