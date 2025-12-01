const CustomerService = require('../services/customerService');

exports.list = async (req, res) => {
    try {
        const data = await CustomerService.getAll(req.query);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(500).json({ ok: false, message: e.message });
    }
};

exports.get = async (req, res) => {
    try {
        const data = await CustomerService.getById(req.params.id);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = await CustomerService.create(req.body);
        res.status(201).json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await CustomerService.update(req.params.id, req.body);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const data = await CustomerService.delete(req.params.id);
        res.json({ ok: true, data });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

exports.getByUser = async (req, res) => {
    try {
        const data = await CustomerService.getByUser(req.params.userId);
        console.log(data)
        res.json({ ok: true, data });
    } catch (e) {
        res.status(404).json({ ok: false, message: e.message });
    }
};
