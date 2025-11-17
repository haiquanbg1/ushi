'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Item belongs to Category
      Item.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });

      // Item has many OrderDetails
      Item.hasMany(models.OrderDetail, {
        foreignKey: 'itemId',
        as: 'orderDetails'
      });

      // Item has many ComboItems
      Item.hasMany(models.ComboItem, {
        foreignKey: 'itemId',
        as: 'comboItems'
      });
    }
  }
  Item.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    image: DataTypes.STRING,
    isAvailable: DataTypes.BOOLEAN,
    sortOrder: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Item',
  });
  return Item;
};