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
        const itemData = {
            ...req.body,
            image: imageData.url,          // Hoặc lưu cả object imageData tùy schema
            imagePublicId: imageData.publicId  // Lưu publicId để xóa sau này
        };

        const data = await ItemService.createItem(itemData);

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