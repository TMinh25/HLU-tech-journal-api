import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import streamifier from 'streamifier';
import config from '../config/config';
import logger from '../config/logger';
import IMongoFile from '../interfaces/file';
import MongoFile from '../models/file.model';
import { validObjectID } from '../utils';

const NAMESPACE = 'FileStorageController';
const { cloudName, apiKey, apiSecret } = config.cloudinary;

v2.config({
	cloudName,
	api_key: apiKey,
	api_secret: apiSecret,
	secure: true,
});

const uploadFileToStorage = async (dir: string, file: Express.Multer.File, filename: string): Promise<UploadApiResponse> => {
	return new Promise((resolve, reject) => {
		let uploadStream = v2.uploader.upload_stream(
			{
				access_mode: 'public',
				folder: dir,
				use_filename: true,
				unique_filename: false,
				filename_override: filename + path.extname(file.originalname),
				resource_type: 'auto',
			},
			(error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
				if (result) {
					resolve(result);
				} else {
					reject(error);
				}
			},
		);
		streamifier.createReadStream(file.buffer).pipe(uploadStream);
	});
};

const uploadFileInfoToDatabase = async (uploadFileResponse: UploadApiResponse, collectionId: mongoose.Types.ObjectId, fileId: mongoose.Types.ObjectId, fileName: string): Promise<IMongoFile> => {
	const { url, format } = uploadFileResponse;
	const file = new MongoFile({
		_id: fileId,
		title: fileName,
		downloadUri: url,
		fileType: format,
	});
	return file.save();
};

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
	console.log(req.file);
	console.log(req.body);
	try {
		const { fileId } = req.params;
		const uploadedFile = req.file;
		if (!uploadedFile) {
			res.status(400).json({ success: false, message: 'No file uploaded', message_vn: 'Không có file nào được tải lên' });
		} else if (!fileId) {
			res.status(400).json({ success: false, message: 'Try again', message_vn: 'Thử lại' });
		} else {
			try {
				const uploadResponse = await uploadFileToStorage('', uploadedFile, fileId);
				const { url, format } = uploadResponse;
				const file = new MongoFile({
					_id: fileId,
					title: uploadedFile.originalname,
					downloadUri: url,
					fileType: format,
				});
				const fileSaveResponse = await file.save();
				return res.status(200).json({ success: true, data: fileSaveResponse });
			} catch (error) {
				logger.error(NAMESPACE, error);
				return res.status(500).json({ success: false, error });
			}
		}
	} catch (error) {
		return res.status(500).json({ success: false, error });
	}
};

const getFileById = async (req: Request, res: Response) => {
	try {
		const { _fileId } = req.params;
		if (!validObjectID(_fileId)) return res.status(400).json({ success: false, message: 'Không hợp lệ' });
		const uploadedFile = await MongoFile.findById(_fileId).exec();
		if (!uploadedFile) return res.status(404).json({ success: true, message: 'Không có tệp tin' });
		res.status(200).json({ success: true, data: uploadedFile });
	} catch (error) {
		logger.error(NAMESPACE, error);
		return res.status(500).json({ success: false, error });
	}
};

export default {
	uploadFile,
	getFileById,
};
