'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PromotionMenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // PromotionMenuItem belongs to Promotion
      PromotionMenuItem.belongsTo(models.Promotion, {
        foreignKey: 'promotionId',
        as: 'promotion'
      });
      
      // PromotionMenuItem belongs to MenuItem
      PromotionMenuItem.belongsTo(models.MenuItem, {
        foreignKey: 'menuItemId',
        as: 'menuItem'
      });
      
      // PromotionMenuItem belongs to Category
      PromotionMenuItem.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }
  PromotionMenuItem.init({
    promotionId: DataTypes.INTEGER,
    menuItemId: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'PromotionMenuItem',
  });
  return PromotionMenuItem;
};