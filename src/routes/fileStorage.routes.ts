import express, { NextFunction, Request, Response } from 'express';
import config from '../config/config';
import controller from '../controllers/fileStorage.controller';
import { checkDirectory, checkFileType } from '../middlewares/fileTypeValidation';
import multer, { diskStorage } from 'multer';
import mongoose from 'mongoose';
import path from 'path';
import MongoFile from '../models/file.model';
import logger from '../config/logger';
import { paramsIsValidMongoID } from '../middlewares/paramsValidation';

const NAMESPACE = 'FileStorageRoutes';

const fileStorageRoutes = express.Router();

const upload = multer({
	storage: diskStorage({
		destination(req, file, cb) {
			const { collectionId } = req.params;
			cb(null, `${config.uploadDir}${collectionId}`);
		},
		filename(req, file, cb) {
			const { fileId } = req.query;
			const filename = fileId + path.extname(file.originalname);
			cb(null, filename);
		},
	}),
	limits: {
		fileSize: 10000000, // max file size 10MB = 10000000 bytes
	},
	fileFilter: (req, file, callback) => checkFileType(file, callback),
});

fileStorageRoutes.post(
	'/upload/collection/:collectionId',
	checkDirectory, // check for exists directory
	(req, res, next) => paramsIsValidMongoID(req, res, next, ['collectionId']), // check for valid params
	(req, res, next) => {
		console.log(req.params);
		const file = new MongoFile();
		req.query.fileId = file._id;
		// pass the fileId to upload.single
		next();
	}, // get file _id in mongo model
	upload.single('file'), // upload file to directory
	controller.uploadFileToCollection, // upload file info to mongodb
);
fileStorageRoutes.get('/collection/:collectionId', (req, res, next) => paramsIsValidMongoID(req, res, next, ['collectionId']), controller.getAllFilesInCollection);
fileStorageRoutes.get('/download/article/:articleId', (req, res, next) => paramsIsValidMongoID(req, res, next, ['articleId']), controller.downloadFile);

export = fileStorageRoutes;
