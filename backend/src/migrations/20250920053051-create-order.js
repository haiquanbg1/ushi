'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderNumber: {
        type: Sequelize.STRING
      },
        customerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Customers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        tableId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Tables',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
        employeeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Employees',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT'
        },
      orderType: {
        type: Sequelize.ENUM('dine-in', 'take-away', 'delivery')
      },
      orderTime: {
        type: Sequelize.DATE
      },
      estimatedTime: {
        type: Sequelize.INTEGER
      },
      subTotal: {
        type: Sequelize.DECIMAL
      },
      taxAmount: {
        type: Sequelize.DECIMAL
      },
      serviceCharge: {
        type: Sequelize.DECIMAL
      },
      discountAmount: {
        type: Sequelize.DECIMAL
      },
      totalAmount: {
        type: Sequelize.DECIMAL
      },
      paymentStatus: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled')
      },
      orderStatus: {
        type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled')
      },
      customerNotes: {
        type: Sequelize.TEXT
      },
      kitchenNotes: {
        type: Sequelize.TEXT
      },
      deliveryAddress: {
        type: Sequelize.TEXT
      },
      deliveryFee: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};