const ItemService = require('../services/menuItemService');

exports.list = async (req, res) => {
    try {
        const data = await ItemService.getAllItems(); // sẵn include Category
        res.json({ ok: true, data });
    } catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try {
        const data = await ItemService.getItemById(req.params.id);
        res.json({ ok: true, data });
    } catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try {
        const data = await ItemService.createItem(req.body);
        res.status(201).json({ ok: true, data });
    } catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try {
        const data = await ItemService.updateItem(req.params.id, req.body);
        res.json({ ok: true, data });
    } catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try {
        const data = await ItemService.deleteItem(req.params.id);
        res.json({ ok: true, data });
    } catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.byCategory = async (req, res) => {
    try {
        const data = await ItemService.getItemsByCategory(req.params.categoryId);
        res.json({ ok: true, data });
    } catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.search = async (req, res) => {
    try {
        const q = req.query.q || '';
        const data = await ItemService.searchItems(q);
        res.json({ ok: true, data });
    } catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};