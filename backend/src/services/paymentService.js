const { Payment, Order, Employee } = require('../models');

class PaymentService {
    async getAllPayments() {
        try {
            return await Payment.findAll({
                include: [
                    { model: Order, as: 'order' },
                    { model: Employee, as: 'processedByEmployee' }
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
                    { model: Employee, as: 'processedByEmployee' }
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
                    { model: Employee, as: 'processedByEmployee' }
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
                    { model: Employee, as: 'processedByEmployee' }
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
}

module.exports = new PaymentService();
