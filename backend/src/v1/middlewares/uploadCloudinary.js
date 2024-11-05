const multer = require('multer');

// Multer setup for file upload
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 },
});

const uploadImages = upload.array('images', 10);

module.exports = {
    uploadImages
};
