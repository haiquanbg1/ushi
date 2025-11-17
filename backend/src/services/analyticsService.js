const { Order, OrderDetail, Item, Payment, Invoice, Customer, Table } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

class AnalyticsService {
    // Get revenue by month for the last 6 months
    async getRevenueByMonth(months = 6) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const orders = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    },
                    orderStatus: {
                        [Op.in]: ['confirmed', 'completed']
                    }
                },
                attributes: ['createdAt', 'totalAmount'],
                raw: true
            });

            // Group by month
            const monthMap = new Map();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            orders.forEach(order => {
                const date = new Date(order.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = monthNames[date.getMonth()];
                
                if (!monthMap.has(monthKey)) {
                    monthMap.set(monthKey, { month: monthName, value: 0 });
                }
                monthMap.get(monthKey).value += parseFloat(order.totalAmount || 0);
            });

            // Convert to array and sort
            const result = Array.from(monthMap.values()).sort((a, b) => {
                const indexA = monthNames.indexOf(a.month);
                const indexB = monthNames.indexOf(b.month);
                return indexA - indexB;
            });

            // Convert to millions
            return result.map(item => ({
                month: item.month,
                value: item.value / 1000000
            }));
        } catch (error) {
            throw new Error(`Error fetching revenue by month: ${error.message}`);
        }
    }

    // Get best selling items
    async getBestSellingItems(limit = 10) {
        try {
            const items = await OrderDetail.findAll({
                include: [
                    {
                        model: Item,
                        as: 'item',
                        attributes: ['name']
                    },
                    {
                        model: Order,
                        as: 'order',
                        where: {
                            orderStatus: {
                                [Op.in]: ['confirmed', 'completed']
                            }
                        },
                        attributes: []
                    }
                ],
                attributes: [
                    'itemId',
                    [Sequelize.fn('SUM', Sequelize.col('OrderDetail.quantity')), 'sold']
                ],
                group: ['itemId', 'item.id'],
                order: [[Sequelize.fn('SUM', Sequelize.col('OrderDetail.quantity')), 'DESC']],
                limit: limit,
                raw: false
            });

            return items.map(item => ({
                name: item.item?.name || 'Unknown',
                sold: parseInt(item.get('sold') || 0)
            }));
        } catch (error) {
            throw new Error(`Error fetching best selling items: ${error.message}`);
        }
    }

    // Get combo vs individual item share
    async getComboShare() {
        try {
            const totalOrders = await OrderDetail.count({
                include: [
                    {
                        model: Order,
                        as: 'order',
                        where: {
                            orderStatus: {
                                [Op.in]: ['confirmed', 'completed']
                            }
                        }
                    }
                ]
            });

            const comboOrders = await OrderDetail.count({
                where: {
                    itemType: 'combo'
                },
                include: [
                    {
                        model: Order,
                        as: 'order',
                        where: {
                            orderStatus: {
                                [Op.in]: ['confirmed', 'completed']
                            }
                        }
                    }
                ]
            });

            const individualOrders = totalOrders - comboOrders;

            return [
                { name: 'Combo', value: totalOrders > 0 ? Math.round((comboOrders / totalOrders) * 100) : 0 },
                { name: 'Lẻ', value: totalOrders > 0 ? Math.round((individualOrders / totalOrders) * 100) : 0 }
            ];
        } catch (error) {
            throw new Error(`Error fetching combo share: ${error.message}`);
        }
    }

    // Get KPIs (Revenue, Orders, Avg Ticket)
    async getKPIs() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            lastMonth.setHours(0, 0, 0, 0);
            const lastMonthEnd = new Date(lastMonth);
            lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1);

            // Current month stats
            const currentMonthOrders = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: today
                    },
                    orderStatus: {
                        [Op.in]: ['confirmed', 'completed']
                    }
                },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                    [Sequelize.fn('AVG', Sequelize.col('totalAmount')), 'avgTicket']
                ],
                raw: true
            });

            // Last month stats
            const lastMonthOrders = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: lastMonth,
                        [Op.lt]: lastMonthEnd
                    },
                    orderStatus: {
                        [Op.in]: ['confirmed', 'completed']
                    }
                },
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
                    [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
                    [Sequelize.fn('AVG', Sequelize.col('totalAmount')), 'avgTicket']
                ],
                raw: true
            });

            const current = currentMonthOrders[0] || { count: 0, revenue: 0, avgTicket: 0 };
            const last = lastMonthOrders[0] || { count: 0, revenue: 0, avgTicket: 0 };

            const revenue = parseFloat(current.revenue || 0);
            const lastRevenue = parseFloat(last.revenue || 0);
            const revenueTrend = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue * 100).toFixed(1) : 0;

            const orders = parseInt(current.count || 0);
            const lastOrders = parseInt(last.count || 0);
            const ordersTrend = lastOrders > 0 ? ((orders - lastOrders) / lastOrders * 100).toFixed(1) : 0;

            const avgTicket = parseFloat(current.avgTicket || 0);
            const lastAvgTicket = parseFloat(last.avgTicket || 0);
            const avgTicketTrend = lastAvgTicket > 0 ? ((avgTicket - lastAvgTicket) / lastAvgTicket * 100).toFixed(1) : 0;

            return [
                {
                    title: 'Revenue (M VND)',
                    value: (revenue / 1000000).toFixed(1),
                    trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}% MoM`,
                    state: revenueTrend >= 0 ? 'good' : 'warn'
                },
                {
                    title: 'Orders',
                    value: orders.toLocaleString(),
                    trend: `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}% MoM`,
                    state: ordersTrend >= 0 ? 'good' : 'warn'
                },
                {
                    title: 'Avg. Ticket (k)',
                    value: (avgTicket / 1000).toFixed(0),
                    trend: `${avgTicketTrend >= 0 ? '+' : ''}${avgTicketTrend}% MoM`,
                    state: Math.abs(avgTicketTrend) < 5 ? 'neutral' : avgTicketTrend >= 0 ? 'good' : 'warn'
                }
            ];
        } catch (error) {
            throw new Error(`Error fetching KPIs: ${error.message}`);
        }
    }

    // Get revenue vs orders comparison
    async getRevenueVsOrders(months = 6) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - months);

            const orders = await Order.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lte]: endDate
                    },
                    orderStatus: {
                        [Op.in]: ['confirmed', 'completed']
                    }
                },
                attributes: ['createdAt', 'totalAmount'],
                raw: true
            });

            // Group by month
            const monthMap = new Map();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            orders.forEach(order => {
                const date = new Date(order.createdAt);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = monthNames[date.getMonth()];
                
                if (!monthMap.has(monthKey)) {
                    monthMap.set(monthKey, { month: monthName, revenue: 0, orders: 0 });
                }
                const monthData = monthMap.get(monthKey);
                monthData.revenue += parseFloat(order.totalAmount || 0);
                monthData.orders += 1;
            });

            // Convert to array and sort
            const result = Array.from(monthMap.values()).sort((a, b) => {
                const indexA = monthNames.indexOf(a.month);
                const indexB = monthNames.indexOf(b.month);
                return indexA - indexB;
            });

            // Convert revenue to millions
            return result.map(item => ({
                month: item.month,
                revenue: item.revenue / 1000000,
                orders: item.orders
            }));
        } catch (error) {
            throw new Error(`Error fetching revenue vs orders: ${error.message}`);
        }
    }
}

module.exports = new AnalyticsService();

