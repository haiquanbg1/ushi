const { Customer, CustomerAddress, Order, Reservation } = require('../models');

class CustomerService {
    async getAllCustomers() {
        try {
            return await Customer.findAll({
                include: [
                    { model: CustomerAddress, as: 'addresses' },
                    { model: Order, as: 'orders' },
                    { model: Reservation, as: 'reservations' }
                ],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            throw new Error(`Error fetching customers: ${error.message}`);
        }
    }

    async getCustomerById(id) {
        try {
            const customer = await Customer.findByPk(id, {
                include: [
                    { model: CustomerAddress, as: 'addresses' },
                    { model: Order, as: 'orders' },
                    { model: Reservation, as: 'reservations' }
                ]
            });
            if (!customer) {
                throw new Error('Customer not found');
            }
            return customer;
        } catch (error) {
            throw new Error(`Error fetching customer: ${error.message}`);
        }
    }

    async createCustomer(customerData) {
        try {
            return await Customer.create(customerData);
        } catch (error) {
            throw new Error(`Error creating customer: ${error.message}`);
        }
    }

    async updateCustomer(id, updateData) {
        try {
            const [updatedCount] = await Customer.update(updateData, {
                where: { id }
            });
            if (updatedCount === 0) {
                throw new Error('Customer not found or no changes made');
            }
            return await this.getCustomerById(id);
        } catch (error) {
            throw new Error(`Error updating customer: ${error.message}`);
        }
    }

    async deleteCustomer(id) {
        try {
            const deletedCount = await Customer.destroy({
                where: { id }
            });
            if (deletedCount === 0) {
                throw new Error('Customer not found');
            }
            return { message: 'Customer deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting customer: ${error.message}`);
        }
    }

    async getCustomerByPhone(phone) {
        try {
            return await Customer.findOne({
                where: { phone },
                include: [
                    { model: CustomerAddress, as: 'addresses' },
                    { model: Order, as: 'orders' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching customer by phone: ${error.message}`);
        }
    }

    async getCustomerByEmail(email) {
        try {
            return await Customer.findOne({
                where: { email },
                include: [
                    { model: CustomerAddress, as: 'addresses' },
                    { model: Order, as: 'orders' }
                ]
            });
        } catch (error) {
            throw new Error(`Error fetching customer by email: ${error.message}`);
        }
    }

    async updateLoyaltyPoints(customerId, points) {
        try {
            const customer = await Customer.findByPk(customerId);
            if (!customer) {
                throw new Error('Customer not found');
            }

            const newPoints = (customer.loyaltyPoints || 0) + points;
            await Customer.update(
                { loyaltyPoints: newPoints },
                { where: { id: customerId } }
            );

            return await this.getCustomerById(customerId);
        } catch (error) {
            throw new Error(`Error updating loyalty points: ${error.message}`);
        }
    }
}

module.exports = new CustomerService();
