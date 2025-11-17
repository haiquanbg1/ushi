const ComboItemService = require("../services/comboItemService")

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await ComboItemService.getAllComboItems() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await ComboItemService.getComboItemById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await ComboItemService.createComboItem(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await ComboItemService.updateComboItem(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await ComboItemService.deleteComboItem(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};