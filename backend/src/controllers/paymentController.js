const PaymentService = require('../services/paymentService');

exports.list = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.getAllPayments() });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.get = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.getPaymentById(req.params.id) });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        res.status(201).json({ ok: true, data: await PaymentService.createPayment(req.body) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.updatePayment(req.params.id, req.body) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.deletePayment(req.params.id) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.byOrderId = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.getPaymentsByOrderId(req.params.orderId) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.byStatus = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.getPaymentsByStatus(req.params.status) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        res.json({ ok: true, data: await PaymentService.confirmPayment(req.params.id, req.body) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

