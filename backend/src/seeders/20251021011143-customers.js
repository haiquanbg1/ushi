'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Customers', [
      // {
      //   id: 1,
      //   userId: 4,
      //   fullName: 'Nguyễn Văn An',
      //   dateOfBirth: new Date('1990-05-15'),
      //   address: '123 Đường Láng',
      //   city: 'Hà Nội',
      //   district: 'Đống Đa',
      //   customerType: 'vip',
      //   loyaltyPoints: 500,
      //   totalSpent: 5000000
      // },
      // {
      //   id: 2,
      //   userId: 5,
      //   fullName: 'Trần Thị Bình',
      //   dateOfBirth: new Date('1985-08-20'),
      //   address: '456 Nguyễn Trãi',
      //   city: 'Hà Nội',
      //   district: 'Thanh Xuân',
      //   customerType: 'member',
      //   loyaltyPoints: 300,
      //   totalSpent: 3000000
      // },
      // {
      //   id: 3,
      //   userId: null,
      //   fullName: 'Lê Hoàng Cường',
      //   dateOfBirth: new Date('1995-03-10'),
      //   address: '789 Giải Phóng',
      //   city: 'Hà Nội',
      //   district: 'Hai Bà Trưng',
      //   customerType: 'regular',
      //   loyaltyPoints: 150,
      //   totalSpent: 1500000
      // },
      // {
      //   id: 4,
      //   userId: 6,
      //   fullName: 'Phạm Thị Dung',
      //   dateOfBirth: new Date('1992-11-25'),
      //   address: '321 Tây Sơn',
      //   city: 'Hà Nội',
      //   district: 'Đống Đa',
      //   customerType: 'vip',
      //   loyaltyPoints: 800,
      //   totalSpent: 8000000
      // },
      // {
      //   id: 5,
      //   userId: null,
      //   fullName: 'Hoàng Văn Em',
      //   dateOfBirth: new Date('1998-07-07'),
      //   address: '654 Xã Đàn',
      //   city: 'Hà Nội',
      //   district: 'Đống Đa',
      //   customerType: 'regular',
      //   loyaltyPoints: 100,
      //   totalSpent: 1000000
      // },
      // {
      //   id: 6,
      //   userId: null,
      //   fullName: 'Vũ Thị Phương',
      //   dateOfBirth: new Date('1988-12-12'),
      //   address: '987 Láng Hạ',
      //   city: 'Hà Nội',
      //   district: 'Ba Đình',
      //   customerType: 'member',
      //   loyaltyPoints: 250,
      //   totalSpent: 2500000
      // },
      // {
      //   id: 7,
      //   userId: null,
      //   fullName: 'Khách vãng lai',
      //   dateOfBirth: null,
      //   address: null,
      //   city: null,
      //   district: null,
      //   customerType: 'guest',
      //   loyaltyPoints: 0,
      //   totalSpent: 0
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Customers', null, {});
  }
};