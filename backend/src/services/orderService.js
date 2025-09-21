const { Order, Customer, Table, Employee, OrderDetail, OrderCombo, Payment, Invoice } = require('../models');

class OrderService {
    async getAllOrders() {
        try {
            return await Order.findAll({
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: Employee, as: 'employee' },
                    { model: OrderDetail, as: 'orderDetails' },
                    { model: OrderCombo, as: 'orderCombos' },
                    { model: Payment, as: 'payments' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching orders: ${error.message}`);
        }
    }

    async getOrderById(id) {
        try {
            const order = await Order.findByPk(id, {
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: Employee, as: 'employee' },
                    { model: OrderDetail, as: 'orderDetails' },
                    { model: OrderCombo, as: 'orderCombos' },
                    { model: Payment, as: 'payments' },
                    { model: Invoice, as: 'invoices' }
                ]
            });
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`);
        }
    }

    async createOrder(orderData) {
        try {
            return await Order.create(orderData);
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }

    async updateOrder(id, updateData) {
        try {
            const [updatedCount] = await Order.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Order not found or no changes made');
            }
            return await this.getOrderById(id);
        } catch (error) {
            throw new Error(`Error updating order: ${error.message}`);
        }
    }

    async deleteOrder(id) {
        try {
            const deletedCount = await Order.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Order not found');
            }
            return { message: 'Order deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting order: ${error.message}`);
        }
    }

    async getOrdersByCustomerId(customerId) {
        try {
            return await Order.findAll({
                where: { customerId },
                include: [
                    { model: Customer, as: 'customer' },
                    { model: OrderDetail, as: 'orderDetails' },
                    { model: Payment, as: 'payments' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching orders by customer ID: ${error.message}`);
        }
    }

    async getOrdersByStatus(status) {
        try {
            return await Order.findAll({
                where: { orderStatus: status },
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: OrderDetail, as: 'orderDetails' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching orders by status: ${error.message}`);
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const [updatedCount] = await Order.update(
                { orderStatus: status },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('Order not found');
            }
            return await this.getOrderById(id);
        } catch (error) {
            throw new Error(`Error updating order status: ${error.message}`);
        }
    }

    async getTodayOrders() {
        try {
            const { Op } = require('sequelize');
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            return await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: today,
                        [Op.lt]: tomorrow
                    }
                },
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: OrderDetail, as: 'orderDetails' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching today's orders: ${error.message}`);
        }
    }
}

module.exports = new OrderService();
