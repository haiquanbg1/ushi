'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // MenuItem belongs to Category
      MenuItem.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
      
      // MenuItem has many MenuVariations
      MenuItem.hasMany(models.MenuVariation, {
        foreignKey: 'menuItemId',
        as: 'variations'
      });
      
      // MenuItem has many OrderDetails
      MenuItem.hasMany(models.OrderDetail, {
        foreignKey: 'menuItemId',
        as: 'orderDetails'
      });
      
      // MenuItem has many ComboItems
      MenuItem.hasMany(models.ComboItem, {
        foreignKey: 'menuItemId',
        as: 'comboItems'
      });
      
      // MenuItem has many PromotionMenuItems
      MenuItem.hasMany(models.PromotionMenuItem, {
        foreignKey: 'menuItemId',
        as: 'promotionMenuItems'
      });
      
      // MenuItem has many OrderComboDetails
      MenuItem.hasMany(models.OrderComboDetail, {
        foreignKey: 'menuItemId',
        as: 'orderComboDetails'
      });
    }
  }
  MenuItem.init({
    categoryId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    cost: DataTypes.DECIMAL,
    imageURL: DataTypes.STRING,
    preparationTime: DataTypes.INTEGER,
    allergens: DataTypes.STRING,
    isVegetarian: DataTypes.BOOLEAN,
    isVegan: DataTypes.BOOLEAN,
    isSpicy: DataTypes.BOOLEAN,
    calories: DataTypes.INTEGER,
    isAvailable: DataTypes.BOOLEAN,
    sortOrder: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MenuItem',
    paranoid: true,
  });
  return MenuItem;
};