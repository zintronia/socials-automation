const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

// Configure multer for file upload

const upload = multer({
  dest: process.env.UPLOAD_DIR,
  fileFilter: (req, file, cb) => {
    console.log('Incoming file:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      console.log('File accepted:', file.originalname);
      cb(null, true);
    } else {
      console.warn('Rejected file:', file.originalname, '| Type:', file.mimetype);
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});


// Routes
router.post('/', upload.single('document'), documentController.upload);
router.get('/', documentController.list);
router.delete('/:id', documentController.delete);

module.exports = router;
