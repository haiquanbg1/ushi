const RoleService = require('../services/roleService');

exports.list = async (_req, res) => {
    try { res.json({ ok: true, data: await RoleService.getAllRoles() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await RoleService.createRole(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};
