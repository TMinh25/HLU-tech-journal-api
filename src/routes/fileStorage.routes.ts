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

fileStorageRoutes.post(
	'/upload',
	(req, res, next) => {
		const file = new MongoFile();
		req.params.fileId = file._id;
		// pass the fileId to upload.single to set filename
		next();
	}, // get file _id in mongo model
	upload.single('file'), // upload file to directory
	controller.uploadFile, // upload file info to mongodb
);

fileStorageRoutes.post(
	'/upload/collection/:collectionId',
	(req, res, next) => {
		const mimetype = 'application/pdf';
		if (req.file && req.file.mimetype !== mimetype) {
			res.status(400).json({ success: false, error: { title: 'Chỉ chấp nhận file pdf' } });
		}
		next();
	},
	(req, res, next) => {
		const file = new MongoFile();
		req.params.fileId = file._id;
		// pass the fileId to upload.single to set filename
		next();
	}, // get file _id in mongo model
	(req, res, next) => paramsIsValidMongoID(req, res, next, ['collectionId', 'fileId']), // check for valid params
	upload.single('file'), // upload file to directory
	controller.uploadFileToCollection, // upload file info to mongodb
);

fileStorageRoutes.get('/collection/:collectionId', (req, res, next) => paramsIsValidMongoID(req, res, next, ['collectionId']), controller.getAllFilesInCollection);

export = fileStorageRoutes;
