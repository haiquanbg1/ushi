'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Promotion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Promotion.hasMany(models.PromotionMenuItem, {
        foreignKey: 'promotionId',
        as: 'promotionMenuItems'
      });
    }
  }
  Promotion.init({
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    value: DataTypes.DECIMAL,
    minOrderAmount: DataTypes.DECIMAL,
    maxDiscount: DataTypes.DECIMAL,
    description: DataTypes.TEXT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    usageLimit: DataTypes.INTEGER,
    usedCount: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Promotion',
  });
  return Promotion;
};