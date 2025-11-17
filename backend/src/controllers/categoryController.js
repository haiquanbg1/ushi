const CategoryService = require('../services/categoryService');

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await CategoryService.getAllCategories() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await CategoryService.getCategoryById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await CategoryService.createCategory(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await CategoryService.updateCategory(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await CategoryService.deleteCategory(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.active = async (req, res) => {
    try { res.json({ ok: true, data: await CategoryService.getActiveCategories() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};