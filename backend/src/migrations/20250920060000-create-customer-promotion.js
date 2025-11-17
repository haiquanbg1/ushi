'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('CustomerPromotions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            customerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Customers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            promotionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Promotions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            usedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.NOW
            },
            orderId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Orders',   // tên bảng Orders
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL', // hoặc CASCADE, tùy logic
                comment: 'ID đơn hàng áp dụng promotion'
            },
            discountAmount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                comment: 'Số tiền giảm giá thực tế'
            },
            status: {
                type: Sequelize.ENUM('available', 'used', 'expired', 'cancelled'),
                defaultValue: 'used'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Thêm indexes để tăng performance
        await queryInterface.addIndex('CustomerPromotions', ['customerId']);
        await queryInterface.addIndex('CustomerPromotions', ['promotionId']);
        await queryInterface.addIndex('CustomerPromotions', ['usedAt']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('CustomerPromotions');
    }
};