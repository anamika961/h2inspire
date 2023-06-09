const express = require("express");
const FileUploadController = require("../controllers/file_upload.controller");
const fileUploadRouter = express.Router();
const multer  = require('multer');

const acceptedFileTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const upload = multer({ 
    // dest: 'uploads/',
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (!acceptedFileTypes.includes(file.mimetype)) {
          return cb(new Error('Only .png, .jpg, .jpeg, .pdf, .csv, .doc, .docx format allowed!'))
        }
        cb(null, true)
    }
})

/**
 * Basic file upload
 */
fileUploadRouter.post("/upload", upload.single('file'), FileUploadController.upload);

/**
 * This method is used import CSV file to database
 */
fileUploadRouter.post('/save-csv-to-db/:csvType', upload.single('file'), FileUploadController.saveCsvToDB);

module.exports = fileUploadRouter;