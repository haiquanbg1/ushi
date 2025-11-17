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

      // OrderDetail belongs to Item (optional - cho món lẻ)
      OrderDetail.belongsTo(models.Item, {
        foreignKey: 'itemId',
        as: 'item'
      });

      // OrderDetail belongs to Combo (optional - cho combo)
      OrderDetail.belongsTo(models.Combo, {
        foreignKey: 'comboId',
        as: 'combo'
      });
    }
  }
  OrderDetail.init({
    orderId: DataTypes.INTEGER,
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: true  // Cho phép null khi là combo
    },
    comboId: {
      type: DataTypes.INTEGER,
      allowNull: true  // Cho phép null khi là món lẻ
    },
    quantity: DataTypes.INTEGER,
    unitPrice: DataTypes.DECIMAL,
    totalPrice: DataTypes.DECIMAL,
    specialInstructions: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending', 'preparing', 'ready', 'served', 'cancelled'),
      defaultValue: 'pending'
    },
    itemType: {
      type: DataTypes.ENUM('menu_item', 'combo'),
      allowNull: false,
      defaultValue: 'menu_item',
      comment: 'Loại item: món lẻ hoặc combo'
    }
  }, {
    sequelize,
    modelName: 'OrderDetail',
    validate: {
      // Đảm bảo hoặc có itemId hoặc có comboId
      eitherItemOrCombo() {
        if (!this.itemId && !this.comboId) {
          throw new Error('OrderDetail phải có itemId hoặc comboId');
        }
        if (this.itemId && this.comboId) {
          throw new Error('OrderDetail không thể có cả itemId và comboId');
        }
      }
    },
    timestamps: false,
  });
  return OrderDetail;
};