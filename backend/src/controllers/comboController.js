const ComboService = require('../services/comboService');
const ComboItemService = require('../services/comboItemService');
const cloudinary = require('cloudinary').v2; // Import cloudinary

exports.list = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.getAllCombos() }); }
    catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};

exports.get = async (req, res) => {
    try { res.json({ ok: true, data: await ComboService.getComboById(req.params.id) }); }
    catch (e) { res.status(404).json({ ok: false, message: e.message }); }
};

exports.create = async (req, res) => {
    try {
        // Kiểm tra xem có file được upload không
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'Vui lòng upload hình ảnh'
            });
        }

        // Gộp dữ liệu từ body và thông tin image
        const comboData = {
            ...req.body,
            image: req.file.path          // Chỉ lưu URL
        };

        const data = await ComboService.createCombo(comboData);

        res.status(201).json({
            ok: true,
            data
        });
    } catch (e) {
        console.error('Error in create controller:', e);

        // Nếu có lỗi và đã upload file, xóa file trên Cloudinary
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting uploaded file:', deleteError);
            }
        }

        res.status(400).json({
            ok: false,
            message: e.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        let comboData = { ...req.body };

        // Nếu có file mới được upload, cập nhật URL ảnh mới
        if (req.file) {
            comboData.image = req.file.path;
        }

        const data = await ComboService.updateCombo(req.params.id, comboData);

        res.json({ ok: true, data });
    } catch (e) {
        console.error('Error in update controller:', e);

        // Nếu có lỗi và đã upload file mới, xóa file mới trên Cloudinary
        if (req.file && req.file.filename) {
            try {
                await cloudinary.uploader.destroy(req.file.filename);
            } catch (deleteError) {
                console.error('Error deleting uploaded file:', deleteError);
            }
        }

        res.status(400).json({ ok: false, message: e.message });
    }
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