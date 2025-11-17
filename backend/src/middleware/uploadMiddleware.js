const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary');

// Cấu hình storage cho Multer với Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
    }
});

// Middleware upload single file
const uploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        // Kiểm tra loại file
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không hợp lệ. Chỉ chấp nhận: jpg, png, gif, pdf'));
        }
    }
}).single('file');

module.exports = uploadMiddleware;