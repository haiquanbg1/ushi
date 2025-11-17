const { Invoice, Order, OrderDetail, Table } = require('../models');
const { Op } = require('sequelize');

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
            // If orderId is provided, fetch order details to populate invoice
            let order = null;
            if (invoiceData.orderId) {
                order = await Order.findByPk(invoiceData.orderId, {
                    include: [
                        { model: OrderDetail, as: 'orderDetails' }
                    ]
                });
                
                if (!order) {
                    throw new Error('Order not found');
                }

                // Generate invoice number if not provided
                if (!invoiceData.invoiceNumber) {
                    const date = new Date();
                    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
                    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    invoiceData.invoiceNumber = `INV-${dateStr}-${randomNum}`;
                }

                // Calculate totals from order if not provided
                if (!invoiceData.subTotal && order.totalAmount) {
                    invoiceData.subTotal = order.totalAmount;
                }
                if (!invoiceData.totalAmount && order.totalAmount) {
                    invoiceData.totalAmount = order.totalAmount;
                }
            }

            const invoice = await Invoice.create(invoiceData);

            // Update order status to 'completed' if order exists
            if (order) {
                await Order.update(
                    { orderStatus: 'completed' },
                    { where: { id: order.id } }
                );

                // Update table status to 'available' if tableId exists
                if (order.tableId) {
                    const TableService = require('./tableService');
                    await TableService.updateTable(order.tableId, { status: 'available' });
                }
            }

            return invoice;
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
