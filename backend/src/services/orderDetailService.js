const { OrderDetail, Order, Item, Combo } = require('../models');
const { Op } = require('sequelize');

class OrderDetailService {
    async getAllOrderDetails() {
        try {
            return await OrderDetail.findAll({
                include: [
                    { model: Order, as: 'order' },
                    { model: Item, as: 'item' },
                    { model: Combo, as: 'combo' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching order details: ${error.message}`);
        }
    }

    async getOrderDetailById(id) {
        try {
            const orderDetail = await OrderDetail.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                    { model: Item, as: 'item' },
                    { model: Combo, as: 'combo' }
                ]
            });
            if (!orderDetail) {
                throw new Error('Order detail not found');
            }
            return orderDetail;
        } catch (error) {
            throw new Error(`Error fetching order detail: ${error.message}`);
        }
    }

    async createOrderDetail(orderDetailData) {
        try {
            return await OrderDetail.create(orderDetailData);
        } catch (error) {
            throw new Error(`Error creating order detail: ${error.message}`);
        }
    }

    async updateOrderDetail(id, updateData) {
        try {
            const [updatedCount] = await OrderDetail.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Order detail not found or no changes made');
            }
            return await this.getOrderDetailById(id);
        } catch (error) {
            console.log(error);
            throw new Error(`Error updating order detail: ${error.message}`);
        }
    }

    async updateOrderDetailItem(id, updateData) {
        try {
            // First verify this is an item-based order detail
            const orderDetail = await OrderDetail.findByPk(id);
            if (!orderDetail) {
                throw new Error('Order detail not found');
            }
            if (!orderDetail.itemId) {
                throw new Error('This order detail is not an item. Use updateOrderDetailCombo instead.');
            }
            if (orderDetail.comboId) {
                throw new Error('Order detail cannot have both itemId and comboId');
            }

            // Ensure we don't accidentally update itemId or comboId
            const { itemId, comboId, ...safeUpdateData } = updateData;
            console.log(safeUpdateData);
            const [updatedCount] = await OrderDetail.update(safeUpdateData, {
                where: { id }
            });
            console.log(updatedCount);
            if (updatedCount === 0) {
                throw new Error('Order detail not found or no changes made');
            }
            return await this.getOrderDetailById(id);
        } catch (error) {
            console.log(error);
            throw new Error(`Error updating order detail item: ${error.message}`);
        }
    }

    async updateOrderDetailCombo(id, updateData) {
        try {
            // First verify this is a combo-based order detail
            const orderDetail = await OrderDetail.findByPk(id);
            if (!orderDetail) {
                throw new Error('Order detail not found');
            }
            if (!orderDetail.comboId) {
                throw new Error('This order detail is not a combo. Use updateOrderDetailItem instead.');
            }
            if (orderDetail.itemId) {
                throw new Error('Order detail cannot have both itemId and comboId');
            }

            // Ensure we don't accidentally update itemId or comboId
            const { itemId, comboId, ...safeUpdateData } = updateData;
            const [updatedCount] = await OrderDetail.update(safeUpdateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Order detail not found or no changes made');
            }
            return await this.getOrderDetailById(id);
        } catch (error) {
            throw new Error(`Error updating order detail combo: ${error.message}`);
        }
    }

    async deleteOrderDetail(id) {
        try {
            const deletedCount = await OrderDetail.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Order detail not found');
            }
            return { message: 'Order detail deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting order detail: ${error.message}`);
        }
    }

    async getOrderDetailsByOrderId(orderId) {
        try {
            return await OrderDetail.findAll({
                where: { orderId },
                include: [
                    { model: Item, as: 'item' },
                    { model: Combo, as: 'combo' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching order details by order ID: ${error.message}`);
        }
    }
}

module.exports = new OrderDetailService();
