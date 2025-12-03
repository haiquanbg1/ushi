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
    try {
        // Kiểm tra xem có file được upload không
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'Vui lòng upload hình ảnh'
            });
        }

        // Lấy thông tin file từ Cloudinary
        const imageData = {
            url: req.file.path,           // URL của file trên Cloudinary
            publicId: req.file.filename    // Public ID để xóa file sau này nếu cần
        };

        // Gộp dữ liệu từ body và thông tin image
        const comboData = {
            ...req.body,
            image: imageData.url,          // Hoặc lưu cả object imageData tùy schema
            imagePublicId: imageData.publicId  // Lưu publicId để xóa sau này
        };

        const data = await ComboService.createCombo(comboData)

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
    }
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
