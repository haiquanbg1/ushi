const OrderService = require('../services/orderService');

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getAllOrders() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getOrderById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await OrderService.createOrder(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.updateOrder(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.deleteOrder(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.byCustomer = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getOrdersByCustomerId(req.params.customerId) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.byStatus = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getOrdersByStatus(req.params.status) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.updateStatus = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.updateOrderStatus(req.params.id, req.body.status) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.today = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getTodayOrders() }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.byTableActive = async (req, res) => {
    try { res.json({ ok: true, data: await OrderService.getActiveOrderByTableId(req.params.tableId) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.getActiveUnpaid = async (req, res) => {
    try {
        const { customerId, tableId } = req.query;
        if (!customerId) {
            return res.status(400).json({ ok: false, message: 'customerId is required' });
        }
        res.json({ ok: true, data: await OrderService.getActiveUnpaidOrder(customerId, tableId || null) });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};

exports.addItems = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ ok: false, message: 'items array is required' });
        }
        res.json({ ok: true, data: await OrderService.addItemsToOrder(req.params.id, items) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};