import path from 'path';
import logger from '../config/logger';
import fs from 'fs';
import config from '../config/config';
import { NextFunction, Request, Response } from 'express';

const NAMESPACE = 'FileTypeValidation';

export function checkFileType(file: Express.Multer.File, callback: Function) {
	// Allowed ext
	const mimetype = 'application/pdf';
	if (file.mimetype !== mimetype) {
		return callback(new Error('only upload files with pdf'));
	}
	callback(null, true); // continue with upload
}

export function checkDirectory(req: Request, res: Response, next: NextFunction) {
	if (!fs.existsSync(config.uploadDir)) {
		fs.mkdirSync(config.uploadDir);
	}
	if (!fs.existsSync(`${config.uploadDir}${req.params.collectionId}`)) {
		fs.mkdirSync(`${config.uploadDir}${req.params.collectionId}`, { recursive: true });
	}
	if (fs.existsSync(`${config.uploadDir}${req.params.collectionId}`)) {
		next(); // continue to upload file
	}
}
