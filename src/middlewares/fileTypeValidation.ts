import path from 'path';
import logger from '../config/logger';
import fs from 'fs';
import config from '../config/config';
import { NextFunction, Request, Response } from 'express';

const NAMESPACE = 'FileTypeValidation';

export function checkFileType(file: Express.Multer.File, callback: Function) {
	// Allowed type
	const mimetype = 'application/pdf';
	if (file.mimetype !== mimetype) {
		return callback(new Error('only upload files with pdf'));
	}
	callback(null, true); // continue with upload
}
