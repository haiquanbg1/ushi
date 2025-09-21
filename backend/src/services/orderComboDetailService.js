const { OrderComboDetail, OrderCombo, MenuItem, Order, Combo } = require('../models');

class OrderComboDetailService {
    async getAllOrderComboDetails() {
        try {
            return await OrderComboDetail.findAll({
                include: [
                    {
                        model: OrderCombo,
                        as: 'orderCombo',
                        include: [
                            { model: Order, as: 'order' },
                            { model: Combo, as: 'combo' }
                        ]
                    },
                    { model: MenuItem, as: 'menuItem' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combo details: ${error.message}`);
        }
    }

    async getOrderComboDetailById(id) {
        try {
            const orderComboDetail = await OrderComboDetail.findByPk(id, {
                include: [
                    {
                        model: OrderCombo,
                        as: 'orderCombo',
                        include: [
                            { model: Order, as: 'order' },
                            { model: Combo, as: 'combo' }
                        ]
                    },
                    { model: MenuItem, as: 'menuItem' }
                ]
            });
            if (!orderComboDetail) {
                throw new Error('Order combo detail not found');
            }
            return orderComboDetail;
        } catch (error) {
            throw new Error(`Error fetching order combo detail: ${error.message}`);
        }
    }

    async createOrderComboDetail(orderComboDetailData) {
        try {
            return await OrderComboDetail.create(orderComboDetailData);
        } catch (error) {
            throw new Error(`Error creating order combo detail: ${error.message}`);
        }
    }

    async updateOrderComboDetail(id, updateData) {
        try {
            const [updatedCount] = await OrderComboDetail.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Order combo detail not found or no changes made');
            }
            return await this.getOrderComboDetailById(id);
        } catch (error) {
            throw new Error(`Error updating order combo detail: ${error.message}`);
        }
    }

    async deleteOrderComboDetail(id) {
        try {
            const deletedCount = await OrderComboDetail.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Order combo detail not found');
            }
            return { message: 'Order combo detail deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting order combo detail: ${error.message}`);
        }
    }

    async getOrderComboDetailsByOrderComboId(orderComboId) {
        try {
            return await OrderComboDetail.findAll({
                where: { orderComboId },
                include: [{ model: MenuItem, as: 'menuItem' }],
                order: [['createdAt', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combo details by order combo ID: ${error.message}`);
        }
    }

    async getOrderComboDetailsByMenuItemId(menuItemId) {
        try {
            return await OrderComboDetail.findAll({
                where: { menuItemId },
                include: [
                    {
                        model: OrderCombo,
                        as: 'orderCombo',
                        include: [
                            { model: Order, as: 'order' },
                            { model: Combo, as: 'combo' }
                        ]
                    },
                    { model: MenuItem, as: 'menuItem' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combo details by menu item ID: ${error.message}`);
        }
    }

    async createMultipleOrderComboDetails(orderComboDetailsData) {
        try {
            return await OrderComboDetail.bulkCreate(orderComboDetailsData);
        } catch (error) {
            throw new Error(`Error creating multiple order combo details: ${error.message}`);
        }
    }

    async updateOrderComboDetailQuantity(id, quantity) {
        try {
            if (quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            const [updatedCount] = await OrderComboDetail.update(
                { quantity },
                { where: { id } }
            );

            if (updatedCount === 0) {
                throw new Error('Order combo detail not found');
            }

            return await this.getOrderComboDetailById(id);
        } catch (error) {
            throw new Error(`Error updating order combo detail quantity: ${error.message}`);
        }
    }

    async deleteOrderComboDetailsByOrderComboId(orderComboId) {
        try {
            const deletedCount = await OrderComboDetail.destroy({
                where: { orderComboId }
            });
            return {
                message: `${deletedCount} order combo details deleted successfully`,
                deletedCount
            };
        } catch (error) {
            throw new Error(`Error deleting order combo details by order combo ID: ${error.message}`);
        }
    }

    async getTotalQuantityByOrderComboId(orderComboId) {
        try {
            const { Op } = require('sequelize');
            const sequelize = require('../models').sequelize;

            const result = await OrderComboDetail.findOne({
                where: { orderComboId },
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
                ],
                raw: true
            });

            return result.totalQuantity || 0;
        } catch (error) {
            throw new Error(`Error calculating total quantity: ${error.message}`);
        }
    }
}

module.exports = new OrderComboDetailService();
