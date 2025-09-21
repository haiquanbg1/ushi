'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Order belongs to Customer
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      
      // Order belongs to Table
      Order.belongsTo(models.Table, {
        foreignKey: 'tableId',
        as: 'table'
      });
      
      // Order belongs to Employee
      Order.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });
      
      // Order has many OrderDetails
      Order.hasMany(models.OrderDetail, {
        foreignKey: 'orderId',
        as: 'orderDetails'
      });
      
      // Order has many OrderCombos
      Order.hasMany(models.OrderCombo, {
        foreignKey: 'orderId',
        as: 'orderCombos'
      });
      
      // Order has many Payments
      Order.hasMany(models.Payment, {
        foreignKey: 'orderId',
        as: 'payments'
      });
      
      // Order has many Invoices
      Order.hasMany(models.Invoice, {
        foreignKey: 'orderId',
        as: 'invoices'
      });
    }
  }
  Order.init({
    orderNumber: DataTypes.STRING,
    customerId: DataTypes.INTEGER,
    tableId: DataTypes.INTEGER,
    employeeId: DataTypes.INTEGER,
    orderType: {
      type: DataTypes.ENUM('dine-in', 'take-away', 'delivery'),
      allowNull: false,
      defaultValue: 'dine-in'
    },
    orderTime: DataTypes.DATE,
    estimatedTime: DataTypes.INTEGER,
    subTotal: DataTypes.DECIMAL,
    taxAmount: DataTypes.DECIMAL,
    serviceCharge: DataTypes.DECIMAL,
    discountAmount: DataTypes.DECIMAL,
    totalAmount: DataTypes.DECIMAL,
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    customerNotes: DataTypes.TEXT,
    kitchenNotes: DataTypes.TEXT,
    deliveryAddress: DataTypes.TEXT,
    deliveryFee: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};