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
      // Category has many Items
      Category.hasMany(models.Item, {
        foreignKey: 'categoryId',
        as: 'items'
      });
    }
  }
  Category.init({
    categoryName: DataTypes.STRING,
    description: DataTypes.TEXT,
    image: DataTypes.STRING,
    sortOrder: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};