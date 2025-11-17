'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class CustomerPromotion extends Model {
        static associate(models) {
            CustomerPromotion.belongsTo(models.Customer, {
                foreignKey: 'customerId',
                as: 'customer'
            });

            CustomerPromotion.belongsTo(models.Promotion, {
                foreignKey: 'promotionId',
                as: 'promotion'
            });

            CustomerPromotion.belongsTo(models.Order, {
                foreignKey: 'orderId',
                as: 'order'
            });
        }
    }
    CustomerPromotion.init({
        usedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        discountAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            comment: 'Số tiền giảm giá thực tế'
        },
        status: {
            type: DataTypes.ENUM('available', 'used', 'expired', 'cancelled'),
            defaultValue: 'used'
        }
    }, {
        sequelize,
        modelName: 'CustomerPromotion',
        tableName: 'CustomerPromotions',
        indexes: [
            {
                unique: false,
                fields: ['customerId']
            },
            {
                unique: false,
                fields: ['promotionId']
            },
            {
                unique: false,
                fields: ['usedAt']
            }
        ]
    });
    return CustomerPromotion;
};