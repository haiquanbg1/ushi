const { Invoice, Order } = require('../models');

class InvoiceService {
    async getAllInvoices() {
        try {
            return await Invoice.findAll({
                include: [{ model: Order, as: 'order' }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching invoices: ${error.message}`);
        }
    }

    async getInvoiceById(id) {
        try {
            const invoice = await Invoice.findByPk(id, {
                include: [{ model: Order, as: 'order' }]
            });
            if (!invoice) {
                throw new Error('Invoice not found');
            }
            return invoice;
        } catch (error) {
            throw new Error(`Error fetching invoice: ${error.message}`);
        }
    }

    async createInvoice(invoiceData) {
        try {
            return await Invoice.create(invoiceData);
        } catch (error) {
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    }

    async updateInvoice(id, updateData) {
        try {
            const [updatedCount] = await Invoice.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Invoice not found or no changes made');
            }
            return await this.getInvoiceById(id);
        } catch (error) {
            throw new Error(`Error updating invoice: ${error.message}`);
        }
    }

    async deleteInvoice(id) {
        try {
            const deletedCount = await Invoice.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Invoice not found');
            }
            return { message: 'Invoice deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting invoice: ${error.message}`);
        }
    }

    async getInvoiceByOrderId(orderId) {
        try {
            return await Invoice.findOne({
                where: { orderId },
                include: [{ model: Order, as: 'order' }]
            });
        } catch (error) {
            throw new Error(`Error fetching invoice by order ID: ${error.message}`);
        }
    }

    async getInvoiceByInvoiceNumber(invoiceNumber) {
        try {
            return await Invoice.findOne({
                where: { invoiceNumber },
                include: [{ model: Order, as: 'order' }]
            });
        } catch (error) {
            throw new Error(`Error fetching invoice by invoice number: ${error.message}`);
        }
    }
}

module.exports = new InvoiceService();
