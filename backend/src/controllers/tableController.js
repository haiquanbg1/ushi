const TableService = require('../services/tableService');
const RoleService = require("../services/roleService");

exports.list = async (req, res) => {
    const user = req.user;

    try {
        const role = await RoleService.getRoleById(user.roleId);

        let response = {};
        if (role.roleName == "Admin") {
            response = await TableService.getAllTables();
        } else {
            response = await TableService.getAllTablesActive();
        }
        res.json({ ok: true, data: response });
    }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try {
        res.json({ ok: true, data: await TableService.getTableById(req.params.id) });
    }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try { res.status(201).json({ ok: true, data: await TableService.createTable(req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.update = async (req, res) => {
    try { res.json({ ok: true, data: await TableService.updateTable(req.params.id, req.body) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};

exports.remove = async (req, res) => {
    try { res.json({ ok: true, data: await TableService.deleteTable(req.params.id) }); }
    catch (e) { res.status(400).json({ ok: false, message: e.message }); }
};
