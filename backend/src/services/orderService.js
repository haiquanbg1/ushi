const { Order, Customer, Table, OrderDetail, Payment, Invoice } = require('../models');

class OrderService {
    async getAllOrders() {
        try {
            return await Order.findAll({
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: OrderDetail, as: 'orderDetails' },
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
                    { model: OrderDetail, as: 'orderDetails' },
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
            const order = await Order.create(orderData);

            // Update table status to 'occupied' if tableId is provided
            if (orderData.tableId) {
                const TableService = require('./tableService');
                await TableService.updateTable(orderData.tableId, { status: 'occupied' });
            }

            return order;
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

    async getActiveOrderByTableId(tableId) {
        try {
            const { Op } = require('sequelize');
            // Active orders: 'pending' or 'confirmed'
            const order = await Order.findOne({
                where: {
                    tableId: tableId,
                    orderStatus: {
                        [Op.in]: ['pending', 'confirmed']
                    }
                },
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: OrderDetail, as: 'orderDetails' }
                ],
                order: [['createdAt', 'DESC']]
            });
            return order;
        } catch (error) {
            throw new Error(`Error fetching active order for table: ${error.message}`);
        }
    }

    async getActiveUnpaidOrder(customerId, tableId = null) {
        try {
            const { Op } = require('sequelize');
            const Payment = require('../models').Payment;

            // Find orders that are pending or confirmed
            const whereClause = {
                customerId: customerId,
                orderStatus: {
                    [Op.in]: ['pending', 'confirmed']
                }
            };

            if (tableId) {
                whereClause.tableId = tableId;
            }

            const orders = await Order.findAll({
                where: whereClause,
                include: [
                    { model: Customer, as: 'customer' },
                    { model: Table, as: 'table' },
                    { model: OrderDetail, as: 'orderDetails' },
                    {
                        model: Payment,
                        as: 'payments',
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            // Filter to find orders without paid payments
            for (const order of orders) {
                const payments = order.payments || [];
                const hasPaidPayment = payments.some(p => p.paymentStatus === 'paid');

                if (!hasPaidPayment) {
                    return order;
                }
            }

            return null;
        } catch (error) {
            throw new Error(`Error fetching active unpaid order: ${error.message}`);
        }
    }

    async addItemsToOrder(orderId, items) {
        try {
            const OrderDetail = require('../models').OrderDetail;
            const order = await this.getOrderById(orderId);

            if (!order) {
                throw new Error('Order not found');
            }

            if (order.orderStatus === 'completed' || order.orderStatus === 'cancelled') {
                throw new Error('Cannot add items to completed or cancelled order');
            }

            // Add new order details
            const newOrderDetails = await Promise.all(
                items.map(item =>
                    OrderDetail.create({
                        orderId: orderId,
                        itemId: item.itemId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        status: 'pending'
                    })
                )
            );

            // Recalculate order total
            const allOrderDetails = await OrderDetail.findAll({
                where: { orderId: orderId }
            });

            const newTotal = allOrderDetails.reduce((sum, detail) => {
                return sum + (parseFloat(detail.unitPrice) * parseInt(detail.quantity));
            }, 0);

            await Order.update(
                { totalAmount: newTotal },
                { where: { id: orderId } }
            );

            return await this.getOrderById(orderId);
        } catch (error) {
            throw new Error(`Error adding items to order: ${error.message}`);
        }
    }
}

module.exports = new OrderService();
