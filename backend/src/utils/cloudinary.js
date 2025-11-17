const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file lên Cloudinary
 * @param {String} filePath - Đường dẫn file local
 * @param {String} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise} - Kết quả upload
 */
const uploadToCloudinary = async (filePath, folder = 'uploads') => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            resource_type: 'auto'
        });
        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Upload buffer/base64 lên Cloudinary
 * @param {Buffer|String} fileBuffer - Buffer hoặc base64 string
 * @param {String} folder - Thư mục lưu trữ
 * @returns {Promise} - Kết quả upload
 */
const uploadBufferToCloudinary = async (fileBuffer, folder = 'uploads') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject({
                        success: false,
                        message: error.message
                    });
                } else {
                    resolve({
                        success: true,
                        url: result.secure_url,
                        publicId: result.public_id,
                        format: result.format
                    });
                }
            }
        ).end(fileBuffer);
    });
};

/**
 * Lấy thông tin file từ Cloudinary
 * @param {String} publicId - Public ID của file
 * @returns {Promise} - Thông tin file
 */
const getFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId);
        return {
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                format: result.format,
                width: result.width,
                height: result.height,
                bytes: result.bytes,
                createdAt: result.created_at
            }
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Xóa file từ Cloudinary
 * @param {String} publicId - Public ID của file cần xóa
 * @returns {Promise} - Kết quả xóa
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return {
            success: result.result === 'ok',
            message: result.result === 'ok' ? 'Xóa thành công' : 'Xóa thất bại'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Xóa nhiều file từ Cloudinary
 * @param {Array} publicIds - Mảng public IDs
 * @returns {Promise} - Kết quả xóa
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return {
            success: true,
            deleted: result.deleted,
            message: 'Xóa thành công'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Lấy danh sách file trong folder
 * @param {String} folder - Tên folder
 * @returns {Promise} - Danh sách file
 */
const getResourcesByFolder = async (folder = 'uploads') => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: 500
        });
        return {
            success: true,
            resources: result.resources
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    uploadBufferToCloudinary,
    getFromCloudinary,
    deleteFromCloudinary,
    deleteMultipleFromCloudinary,
    getResourcesByFolder
};