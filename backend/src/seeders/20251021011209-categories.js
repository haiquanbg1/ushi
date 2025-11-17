'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        id: 1,
        categoryName: 'Món Khai Vị',
        description: 'Các món khai vị truyền thống và hiện đại',
        image: 'appetizer.jpg',
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        categoryName: 'Món Chính',
        description: 'Các món ăn chính đa dạng',
        image: 'main-course.jpg',
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        categoryName: 'Món Lẩu',
        description: 'Các loại lẩu đặc sắc',
        image: 'hotpot.jpg',
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        categoryName: 'Món Nướng',
        description: 'Các món nướng BBQ thơm ngon',
        image: 'bbq.jpg',
        sortOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        categoryName: 'Hải Sản',
        description: 'Các món hải sản tươi sống',
        image: 'seafood.jpg',
        sortOrder: 5,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        categoryName: 'Salad',
        description: 'Salad tươi mát, bổ dưỡng',
        image: 'salad.jpg',
        sortOrder: 6,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        categoryName: 'Đồ Uống',
        description: 'Nước giải khát, trà, cà phê',
        image: 'drinks.jpg',
        sortOrder: 7,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 8,
        categoryName: 'Tráng Miệng',
        description: 'Các món tráng miệng ngọt ngào',
        image: 'dessert.jpg',
        sortOrder: 8,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};