'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // OrderDetail belongs to Order
      OrderDetail.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      
      // OrderDetail belongs to MenuItem
      OrderDetail.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
      
      // OrderDetail belongs to MenuVariation
      OrderDetail.belongsTo(models.MenuVariation, {
        foreignKey: 'variationId',
        as: 'variation'
      });
    }
  }
  OrderDetail.init({
    orderId: DataTypes.INTEGER,
    menuItemId: DataTypes.INTEGER,
    variationId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    unitPrice: DataTypes.DECIMAL,
    totalPrice: DataTypes.DECIMAL,
    specialInstructions: DataTypes.TEXT,
    status: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled')
  }, {
    sequelize,
    modelName: 'OrderDetail',
  });
  return OrderDetail;
};