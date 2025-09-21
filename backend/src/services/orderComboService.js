const { OrderCombo, Order, Combo, OrderComboDetail, MenuItem } = require('../models');

class OrderComboService {
    async getAllOrderCombos() {
        try {
            return await OrderCombo.findAll({
                include: [
                    { model: Order, as: 'order' },
                    { model: Combo, as: 'combo' },
                    {
                        model: OrderComboDetail,
                        as: 'orderComboDetails',
                        include: [{ model: MenuItem, as: 'menuItem' }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combos: ${error.message}`);
        }
    }

    async getOrderComboById(id) {
        try {
            const orderCombo = await OrderCombo.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    { model: Combo, as: 'combo' },
                    {
                        model: OrderComboDetail,
                        as: 'orderComboDetails',
                        include: [{ model: MenuItem, as: 'menuItem' }]
                    }
                ]
            });
            if (!orderCombo) {
                throw new Error('Order combo not found');
            }
            return orderCombo;
        } catch (error) {
            throw new Error(`Error fetching order combo: ${error.message}`);
        }
    }

    async createOrderCombo(orderComboData) {
        try {
            return await OrderCombo.create(orderComboData);
        } catch (error) {
            throw new Error(`Error creating order combo: ${error.message}`);
        }
    }

    async updateOrderCombo(id, updateData) {
        try {
            const [updatedCount] = await OrderCombo.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Order combo not found or no changes made');
            }
            return await this.getOrderComboById(id);
        } catch (error) {
            throw new Error(`Error updating order combo: ${error.message}`);
        }
    }

    async deleteOrderCombo(id) {
        try {
            const deletedCount = await OrderCombo.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Order combo not found');
            }
            return { message: 'Order combo deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting order combo: ${error.message}`);
        }
    }

    async getOrderCombosByOrderId(orderId) {
        try {
            return await OrderCombo.findAll({
                where: { orderId },
                include: [
                    { model: Combo, as: 'combo' },
                    {
                        model: OrderComboDetail,
                        as: 'orderComboDetails',
                        include: [{ model: MenuItem, as: 'menuItem' }]
                    }
                ],
                order: [['createdAt', 'ASC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combos by order ID: ${error.message}`);
        }
    }

    async getOrderCombosByComboId(comboId) {
        try {
            return await OrderCombo.findAll({
                where: { comboId },
                include: [
                    { model: Order, as: 'order' },
                    { model: Combo, as: 'combo' },
                    {
                        model: OrderComboDetail,
                        as: 'orderComboDetails',
                        include: [{ model: MenuItem, as: 'menuItem' }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching order combos by combo ID: ${error.message}`);
        }
    }

    async calculateOrderComboTotal(orderComboId) {
        try {
            const orderCombo = await OrderCombo.findByPk(orderComboId, {
                include: [{ model: Combo, as: 'combo' }]
            });

            if (!orderCombo) {
                throw new Error('Order combo not found');
            }

            const totalPrice = orderCombo.quantity * orderCombo.unitPrice;

            // Update total price if different
            if (orderCombo.totalPrice !== totalPrice) {
                await OrderCombo.update(
                    { totalPrice },
                    { where: { id: orderComboId } }
                );
            }

            return totalPrice;
        } catch (error) {
            throw new Error(`Error calculating order combo total: ${error.message}`);
        }
    }
}

module.exports = new OrderComboService();
