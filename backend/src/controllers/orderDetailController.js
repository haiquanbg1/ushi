const OrderDetailService = require('../services/orderDetailService');

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.getAllOrderDetails() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.getOrderDetailById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await OrderDetailService.createOrderDetail(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.updateOrderDetail(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.updateItem = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.updateOrderDetailItem(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.updateCombo = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.updateOrderDetailCombo(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.deleteOrderDetail(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.byOrder = async (req, res) => {
    try { res.json({ ok: true, data: await OrderDetailService.getOrderDetailsByOrderId(req.params.orderId) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};
