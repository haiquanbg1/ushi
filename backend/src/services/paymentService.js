const { Payment, Order, OrderDetail, Invoice } = require('../models');

class PaymentService {
    async getAllPayments() {
        try {
            return await Payment.findAll({
                include: [
                    { model: Order, as: 'order' },
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching payments: ${error.message}`);
        }
    }

    async getPaymentById(id) {
        try {
            const payment = await Payment.findByPk(id, {
                include: [
                    { model: Order, as: 'order' },
                ]
            });
            if (!payment) {
                throw new Error('Payment not found');
            }
            return payment;
        } catch (error) {
            throw new Error(`Error fetching payment: ${error.message}`);
        }
    }

    async createPayment(paymentData) {
        try {
            return await Payment.create(paymentData);
        } catch (error) {
            throw new Error(`Error creating payment: ${error.message}`);
        }
    }

    async updatePayment(id, updateData) {
        try {
            const [updatedCount] = await Payment.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Payment not found or no changes made');
            }
            return await this.getPaymentById(id);
        } catch (error) {
            throw new Error(`Error updating payment: ${error.message}`);
        }
    }

    async deletePayment(id) {
        try {
            const deletedCount = await Payment.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Payment not found');
            }
            return { message: 'Payment deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting payment: ${error.message}`);
        }
    }

    async getPaymentsByOrderId(orderId) {
        try {
            return await Payment.findAll({
                where: { orderId },
                include: [
                    { model: Order, as: 'order' },
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching payments by order ID: ${error.message}`);
        }
    }

    async getPaymentsByStatus(status) {
        try {
            return await Payment.findAll({
                where: { paymentStatus: status },
                include: [
                    { model: Order, as: 'order' },
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching payments by status: ${error.message}`);
        }
    }

    async updatePaymentStatus(id, status) {
        try {
            const [updatedCount] = await Payment.update(
                { paymentStatus: status, paymentTime: new Date() },
                { where: { id } }
            );
            if (updatedCount === 0) {
                throw new Error('Payment not found');
            }
            return await this.getPaymentById(id);
        } catch (error) {
            throw new Error(`Error updating payment status: ${error.message}`);
        }
    }

    async confirmPayment(id, paymentData) {
        try {
            const payment = await Payment.findByPk(id, {
                include: [{ model: Order, as: 'order' }]
            });

            if (!payment) {
                throw new Error('Payment not found');
            }

            // Update payment with confirmation data
            const updateData = {
                paymentStatus: 'paid',
                paidAmount: paymentData.paidAmount || payment.amount,
                changeAmount: paymentData.changeAmount || 0,
                paymentMethod: paymentData.paymentMethod || payment.paymentMethod,
                paymentTime: new Date()
            };

            const [updatedCount] = await Payment.update(updateData, {
                where: { id }
            });

            if (updatedCount === 0) {
                throw new Error('Payment not found');
            }

            // Update order status to 'completed'
            if (payment.orderId) {
                const OrderService = require('./orderService');
                await OrderService.updateOrderStatus(payment.orderId, 'completed');

                // Get the order to check if it has a tableId and to use totals
                const order = await Order.findByPk(payment.orderId);
                if (order && order.tableId) {
                    // Update table status to 'available' after payment confirmation
                    const TableService = require('./tableService');
                    await TableService.updateTable(order.tableId, { status: 'available' });
                }

                // Mark all order details as 'served'
                try {
                    await OrderDetail.update(
                        { status: 'served' },
                        { where: { orderId: payment.orderId } }
                    );
                } catch (err) {
                    console.warn('Failed to update order details to served:', err.message);
                }

                // Ensure invoice exists / is updated with payment info
                try {
                    const existingInvoice = await Invoice.findOne({ where: { orderId: payment.orderId } });
                    if (existingInvoice) {
                        // Update invoice with payment method and totals but preserve printed flag
                        await Invoice.update(
                            {
                                paymentMethod: updateData.paymentMethod,
                                totalAmount: order ? order.totalAmount : updateData.paidAmount,
                                subTotal: order ? order.totalAmount : updateData.paidAmount
                            },
                            { where: { id: existingInvoice.id } }
                        );
                    } else {
                        // Create a basic invoice record if none exists
                        const date = new Date();
                        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
                        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                        const invoiceData = {
                            orderId: payment.orderId,
                            invoiceNumber: `INV-${dateStr}-${randomNum}`,
                            subTotal: order ? order.totalAmount : updateData.paidAmount,
                            totalAmount: order ? order.totalAmount : updateData.paidAmount,
                            paymentMethod: updateData.paymentMethod
                        };
                        await Invoice.create(invoiceData);
                    }
                } catch (err) {
                    console.warn('Failed to create/update invoice on payment confirmation:', err.message);
                }
            }

            return await this.getPaymentById(id);
        } catch (error) {
            console.error('Error confirming payment:', error);
            throw new Error(`Error confirming payment: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
