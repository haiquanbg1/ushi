'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      itemId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      comboId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Combos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      unitPrice: {
        type: Sequelize.DECIMAL
      },
      totalPrice: {
        type: Sequelize.DECIMAL
      },
      specialInstructions: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled')
      },
      itemType: {
        type: Sequelize.ENUM('menu_item', 'combo'),
        allowNull: false,
        defaultValue: 'menu_item'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderDetails');
  }
};