const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const UPLOAD_CONFIG = [
  { fieldName: 'logo', folder: 'logos' },
];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const config = UPLOAD_CONFIG.find(c => c.fieldName === file.fieldname);
    const subfolder = config ? config.folder : 'general';
    const dest = path.join(uploadDir, subfolder);
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

const getSubfolder = (fieldName) => {
  const config = UPLOAD_CONFIG.find(c => c.fieldName === fieldName);
  return config ? config.folder : 'general';
};

module.exports = { upload, getSubfolder };
