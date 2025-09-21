'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Employee belongs to User
      Employee.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Employee has many Orders
      Employee.hasMany(models.Order, {
        foreignKey: 'employeeId',
        as: 'orders'
      });

      // Employee has many Reservations (created by)
      Employee.hasMany(models.Reservation, {
        foreignKey: 'createdByEmployeeId',
        as: 'createdReservations'
      });

      // Employee has many Payments (processed by)
      Employee.hasMany(models.Payment, {
        foreignKey: 'processedByEmployeeId',
        as: 'processedPayments'
      });
    }
  }
  Employee.init({
    userId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    position: DataTypes.STRING,
    salary: DataTypes.DECIMAL,
    hireDate: DataTypes.DATE,
    birthDate: DataTypes.DATE,
    emergencyContact: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};