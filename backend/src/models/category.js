'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Category has many MenuItems
      Category.hasMany(models.MenuItem, {
        foreignKey: 'categoryId',
        as: 'menuItems'
      });
      
      // Category has many PromotionMenuItems
      Category.hasMany(models.PromotionMenuItem, {
        foreignKey: 'categoryId',
        as: 'promotionMenuItems'
      });
    }
  }
  Category.init({
    categoryName: DataTypes.STRING,
    description: DataTypes.TEXT,
    imageURL: DataTypes.STRING,
    sortOrder: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};