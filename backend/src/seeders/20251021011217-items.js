'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Items', [
      // Món Khai Vị
      // {
      //   id: 1,
      //   categoryId: 1,
      //   name: 'Gỏi Cuốn Tôm Thịt',
      //   description: 'Gỏi cuốn tươi ngon với tôm và thịt heo',
      //   price: 35000,
      //   image: 'goi-cuon.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 2,
      //   categoryId: 1,
      //   name: 'Chả Giò Hải Sản',
      //   description: 'Chả giò giòn tan với nhân hải sản',
      //   price: 45000,
      //   image: 'cha-gio.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Món Chính
      // {
      //   id: 3,
      //   categoryId: 2,
      //   name: 'Cơm Sườn Nướng',
      //   description: 'Cơm trắng với sườn nướng thơm lừng',
      //   price: 65000,
      //   image: 'com-suon.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 4,
      //   categoryId: 2,
      //   name: 'Phở Bò Đặc Biệt',
      //   description: 'Phở bò với đầy đủ topping',
      //   price: 75000,
      //   image: 'pho-bo.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 5,
      //   categoryId: 2,
      //   name: 'Bún Chả Hà Nội',
      //   description: 'Bún chả truyền thống Hà Nội',
      //   price: 55000,
      //   image: 'bun-cha.jpg',
      //   isAvailable: true,
      //   sortOrder: 3,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Món Lẩu
      // {
      //   id: 6,
      //   categoryId: 3,
      //   name: 'Lẩu Thái Hải Sản',
      //   description: 'Lẩu thái chua cay với hải sản tươi sống',
      //   price: 350000,
      //   image: 'lau-thai.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 7,
      //   categoryId: 3,
      //   name: 'Lẩu Bò Nhúng Giấm',
      //   description: 'Lẩu bò truyền thống với giấm',
      //   price: 320000,
      //   image: 'lau-bo.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Món Nướng
      // {
      //   id: 8,
      //   categoryId: 4,
      //   name: 'Sườn Bò Mỹ Nướng',
      //   description: 'Sườn bò Mỹ cao cấp nướng trên than hoa',
      //   price: 250000,
      //   image: 'suon-bo-my.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 9,
      //   categoryId: 4,
      //   name: 'Gà Nướng Mật Ong',
      //   description: 'Gà nướng với mật ong thơm ngon',
      //   price: 180000,
      //   image: 'ga-nuong.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Hải Sản
      // {
      //   id: 10,
      //   categoryId: 5,
      //   name: 'Tôm Hùm Hấp',
      //   description: 'Tôm hùm tươi sống hấp gừng',
      //   price: 850000,
      //   image: 'tom-hum.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 11,
      //   categoryId: 5,
      //   name: 'Cua Rang Me',
      //   description: 'Cua biển rang me đặc biệt',
      //   price: 380000,
      //   image: 'cua-rang.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Salad
      // {
      //   id: 12,
      //   categoryId: 6,
      //   name: 'Salad Rau Trộn',
      //   description: 'Salad rau xanh tươi mát',
      //   price: 45000,
      //   image: 'salad-rau.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 13,
      //   categoryId: 6,
      //   name: 'Salad Gà Nướng',
      //   description: 'Salad với gà nướng và sốt đặc biệt',
      //   price: 65000,
      //   image: 'salad-ga.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Đồ Uống
      // {
      //   id: 14,
      //   categoryId: 7,
      //   name: 'Trà Đá',
      //   description: 'Trà đá miễn phí',
      //   price: 0,
      //   image: 'tra-da.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 15,
      //   categoryId: 7,
      //   name: 'Nước Ngọt',
      //   description: 'Coca, Pepsi, 7up, Sprite',
      //   price: 15000,
      //   image: 'nuoc-ngot.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 16,
      //   categoryId: 7,
      //   name: 'Sinh Tố Bơ',
      //   description: 'Sinh tố bơ béo ngậy',
      //   price: 35000,
      //   image: 'sinh-to-bo.jpg',
      //   isAvailable: true,
      //   sortOrder: 3,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 17,
      //   categoryId: 7,
      //   name: 'Cà Phê Sữa Đá',
      //   description: 'Cà phê sữa đá truyền thống',
      //   price: 25000,
      //   image: 'ca-phe.jpg',
      //   isAvailable: true,
      //   sortOrder: 4,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // // Tráng Miệng
      // {
      //   id: 18,
      //   categoryId: 8,
      //   name: 'Chè Ba Màu',
      //   description: 'Chè ba màu truyền thống',
      //   price: 25000,
      //   image: 'che-ba-mau.jpg',
      //   isAvailable: true,
      //   sortOrder: 1,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 19,
      //   categoryId: 8,
      //   name: 'Kem Dừa',
      //   description: 'Kem dừa mát lạnh',
      //   price: 30000,
      //   image: 'kem-dua.jpg',
      //   isAvailable: true,
      //   sortOrder: 2,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // },
      // {
      //   id: 20,
      //   categoryId: 8,
      //   name: 'Bánh Flan',
      //   description: 'Bánh flan caramel',
      //   price: 20000,
      //   image: 'banh-flan.jpg',
      //   isAvailable: true,
      //   sortOrder: 3,
      //   isActive: true,
      //   createdAt: new Date(),
      //   updatedAt: new Date()
      // }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Items', null, {});
  }
};