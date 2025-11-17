const { OrderDetail, Order, Item, Combo } = require('../models');

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
            throw new Error(`Error updating order detail: ${error.message}`);
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
                    { model: Order, as: 'order' },
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
