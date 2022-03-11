import express from 'express';
import controller from '../controllers/fileStorage.controller';
import { checkFileType } from '../middlewares/fileTypeValidation';
import multer, { memoryStorage } from 'multer';
import MongoFile from '../models/file.model';
import logger from '../config/logger';
import { paramsIsValidMongoID } from '../middlewares/paramsValidation';
import { tokenAuthorization } from '../middlewares/tokenAuthorization';

const NAMESPACE = 'FileStorageRoutes';

const fileStorageRoutes = express.Router();

const upload = multer({
	storage: memoryStorage(),
	limits: {
		fileSize: 10000000, // max file size 10MB = 10000000 bytes
	},
});

fileStorageRoutes.get('/:_fileId', controller.getFileById);
fileStorageRoutes.post(
	'/upload',
	(req, res, next) => {
		const file = new MongoFile();
		req.params.fileId = String(file._id);
		// pass the fileId to upload.single to set filename
		next();
	}, // get file _id in mongo model
	upload.single('file'), // upload file to directory
	controller.uploadFile, // upload file info to mongodb
);

export = fileStorageRoutes;
