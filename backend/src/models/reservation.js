'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reservation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Reservation belongs to Customer
      Reservation.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer'
      });
      
      // Reservation belongs to Employee (created by)
      Reservation.belongsTo(models.Employee, {
        foreignKey: 'createdByEmployeeId',
        as: 'createdByEmployee'
      });
      
      // Reservation has many ReservationTables
      Reservation.hasMany(models.ReservationTable, {
        foreignKey: 'reservationId',
        as: 'reservationTables'
      });
    }
  }
  Reservation.init({
    customerId: DataTypes.INTEGER,
    customerName: DataTypes.STRING,
    customerPhone: DataTypes.STRING,
    partySize: DataTypes.INTEGER,
    reservationDate: DataTypes.DATE,
    reservationTime: DataTypes.TIME,
    duration: DataTypes.INTEGER,
    specialRequests: DataTypes.TEXT,
    status: DataTypes.ENUM('pending', 'confirmed', 'seated', 'cancelled', 'completed'),
    createdByEmployeeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Reservation',
  });
  return Reservation;
};