const { Customer, User, Order, sequelize } = require('../models');
const { Op } = require('sequelize');

class CustomerService {
    // ===== CRUD Operations =====
    async getAll(filters = {}) {
        const where = {};

        if (filters.customerType) {
            where.customerType = filters.customerType;
        }

        if (filters.search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${filters.search}%` } },
                { phone: { [Op.like]: `%${filters.search}%` } },
                { email: { [Op.like]: `%${filters.search}%` } }
            ];
        }

        const { page = 1, limit = 10 } = filters;
        const offset = (page - 1) * limit;

        const { rows, count } = await Customer.findAndCountAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'email', 'isActive']
            }],
            limit: parseInt(limit),
            offset,
            order: [[filters.sortBy || 'createdAt', filters.order || 'DESC']]
        });

        return {
            customers: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        };
    }

    async getById(id) {
        const customer = await Customer.findByPk(id, {
            include: [{
                model: User,
                as: 'user'
            }]
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return customer;
    }

    async create(data) {
        const transaction = await sequelize.transaction();
        try {
            // Validate userId if provided
            if (data.userId) {
                const user = await User.findByPk(data.userId);
                if (!user) throw new Error('User not found');

                const hasCustomer = await Customer.findOne({ where: { userId: data.userId } });
                if (hasCustomer) throw new Error('User already has customer profile');
            }

            const customer = await Customer.create({
                ...data,
                customerType: data.userId ? 'member' : 'guest',
                loyaltyPoints: 0,
                totalSpent: 0
            }, { transaction });

            await transaction.commit();
            return await this.getById(customer.id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async update(id, data) {
        const transaction = await sequelize.transaction();
        try {
            const customer = await this.getById(id);

            // Prevent updating calculated fields
            delete data.loyaltyPoints;
            delete data.totalSpent;
            delete data.customerType;

            await customer.update(data, { transaction });
            await transaction.commit();

            return await this.getById(id);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async delete(id) {
        const customer = await this.getById(id);

        const orderCount = await Order.count({ where: { customerId: id } });
        if (orderCount > 0) {
            throw new Error('Cannot delete customer with orders');
        }

        await customer.destroy();
        return { message: 'Customer deleted successfully' };
    }

    // ===== Lookup Methods =====
    async findByPhone(phone) {
        return await Customer.findOne({
            where: { phone },
            include: [{ model: User, as: 'user' }]
        });
    }

    async findByEmail(email) {
        return await Customer.findOne({
            where: { email },
            include: [{ model: User, as: 'user' }]
        });
    }

    async findOrCreate(data) {
        const transaction = await sequelize.transaction();
        try {
            let customer = await this.findByPhone(data.phone);

            if (customer) {
                const updates = {};
                if (data.fullName && data.fullName !== customer.fullName) {
                    updates.fullName = data.fullName;
                }
                if (data.email && data.email !== customer.email) {
                    updates.email = data.email;
                }
                if (data.userId && !customer.userId) {
                    updates.userId = data.userId;
                    updates.customerType = 'member';
                }

                if (Object.keys(updates).length > 0) {
                    await customer.update(updates, { transaction });
                }
            } else {
                customer = await Customer.create({
                    ...data,
                    customerType: data.userId ? 'member' : 'guest',
                    loyaltyPoints: 0,
                    totalSpent: 0
                }, { transaction });
            }

            await transaction.commit();
            return customer;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // ===== Stats Methods =====
    async updateStatsAfterOrder(customerId, orderAmount) {
        const transaction = await sequelize.transaction();
        try {
            const customer = await this.getById(customerId);

            const points = Math.floor(orderAmount / 10000);
            customer.loyaltyPoints += points;
            customer.totalSpent = parseFloat(customer.totalSpent || 0) + parseFloat(orderAmount);

            // Auto upgrade
            if (customer.totalSpent >= 50000000) {
                customer.customerType = 'vip';
            } else if (customer.totalSpent >= 10000000 && customer.customerType === 'member') {
                customer.customerType = 'regular';
            }

            await customer.save({ transaction });
            await transaction.commit();

            return { customer, pointsEarned: points };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getByUser(userId) {
        const customer = await Customer.findOne({
            where: { userId }
        });

        if (!customer) {
            throw new Error('Customer not found for the given user');
        }

        return customer;
    }
}

module.exports = new CustomerService();