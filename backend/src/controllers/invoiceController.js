const InvoiceService = require('../services/invoiceService');

exports.list = async (req, res) => {
    try {
        res.json({ ok: true, data: await InvoiceService.getAllInvoices() });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.get = async (req, res) => {
    try {
        res.json({ ok: true, data: await InvoiceService.getInvoiceById(req.params.id) });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        res.status(201).json({ ok: true, data: await InvoiceService.createInvoice(req.body) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        res.json({ ok: true, data: await InvoiceService.updateInvoice(req.params.id, req.body) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        res.json({ ok: true, data: await InvoiceService.deleteInvoice(req.params.id) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.byOrderId = async (req, res) => {
    try {
        res.json({ ok: true, data: await InvoiceService.getInvoiceByOrderId(req.params.orderId) });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

