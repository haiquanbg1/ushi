const ComboService = require('../services/comboService');
const ComboItemService = require('../services/comboItemService');

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.getAllCombos() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.getComboById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await ComboService.createCombo(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.updateCombo(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.deleteCombo(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.items = async (req, res) => {
    try { res.json({ ok: true, data: await ComboItemService.getComboItemsByComboId(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.active = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.getActiveCombos() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};
