'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Promotions', [
      {
        id: 1,
        name: 'Giảm 10% cho hóa đơn trên 500k',
        type: 'percent',
        value: 10,
        minOrderAmount: 500000,
        maxDiscount: 100000,
        description: 'Giảm 10% cho đơn hàng từ 500k trở lên, tối đa 100k',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 1000,
        usedCount: 45,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Giảm 50k cho khách hàng mới',
        type: 'amount',
        value: 50000,
        minOrderAmount: 200000,
        maxDiscount: 50000,
        description: 'Giảm ngay 50k cho khách hàng đặt món lần đầu',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 500,
        usedCount: 123,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Happy Hour - Giảm 15%',
        type: 'percent',
        value: 15,
        minOrderAmount: 300000,
        maxDiscount: 150000,
        description: 'Giảm 15% từ 14h-17h hàng ngày',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 2000,
        usedCount: 567,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Khuyến mãi sinh nhật',
        type: 'percent',
        value: 20,
        minOrderAmount: 1000000,
        maxDiscount: 300000,
        description: 'Giảm 20% cho tiệc sinh nhật từ 10 người',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: 100,
        usedCount: 12,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Thành viên VIP - Giảm 100k',
        type: 'amount',
        value: 100000,
        minOrderAmount: 800000,
        maxDiscount: 100000,
        description: 'Ưu đãi đặc biệt cho thành viên VIP',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        usageLimit: null,
        usedCount: 89,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Combo giá sốc cuối tuần',
        type: 'percent',
        value: 25,
        minOrderAmount: 600000,
        maxDiscount: 200000,
        description: 'Giảm 25% cho combo vào thứ 7, chủ nhật',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-06-30'),
        usageLimit: 300,
        usedCount: 78,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 7,
        name: 'Tri ân khách hàng',
        type: 'amount',
        value: 200000,
        minOrderAmount: 2000000,
        maxDiscount: 200000,
        description: 'Giảm 200k cho đơn hàng từ 2 triệu',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-31'),
        usageLimit: 50,
        usedCount: 15,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Promotions', null, {});
  }
};