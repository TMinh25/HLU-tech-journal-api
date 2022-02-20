import { NextFunction, Request, Response } from 'express';
import path from 'path';
import MongoFile from '../models/file.model';
import config from '../config/config';
import logger from '../config/logger';
import mongoose from 'mongoose';
import IMongoFile from '../interfaces/file';
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';
import fs from 'fs';
import streamifier from 'streamifier';
import { isValidObjectID } from '../utils';

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

const uploadFileInfoToDatabase = async (uploadFileResponse: UploadApiResponse, collectionId: Schema.Types.ObjectId, fileId: Schema.Types.ObjectId, fileName: string): Promise<IMongoFile> => {
	const { url, format } = uploadFileResponse;
	const file = new MongoFile({
		_id: fileId,
		title: fileName,
		downloadUri: url,
		fileType: format,
		collectionId,
	});
	return file.save();
};

/** `[POST]/files/uploads/collection/:collectionId`
 * Lấy tất cả các file có trong collection
 * @param req.file
 * Chứa file cần lưu vào collection
 * @param req.query.collection
 * chứa id của collection cần thêm file vào
 * @param req.query.article
 * chứa id của bài báo cần cập nhật
 * @returns
 * [200]: Thành công lưu file
 *
 * [409]:
 *
 * [500]:
 */
const uploadFileToCollection = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { collectionId, fileId } = req.params;
		const uploadFile = req.file;

		if (!uploadFile) {
			res.status(400).json({ success: false, message: 'No file uploaded', message_vn: 'Không có file nào được tải lên' });
		} else if (!fileId) {
			res.status(400).json({ success: false, message: 'Try again', message_vn: 'Thử lại' });
		} else {
			try {
				const uploadResponse = await uploadFileToStorage(collectionId, uploadFile, fileId);
				// const responseBody = await uploadResponse.json();
				logger.debug(NAMESPACE, uploadResponse);
				const fileSaveResponse = await uploadFileInfoToDatabase(uploadResponse, collectionId, fileId, uploadFile.originalname);
				return res.status(200).json({ success: true, data: fileSaveResponse });
			} catch (error) {
				logger.error(NAMESPACE, error);
				return res.status(500).json({ success: false, error });
			}
		}
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(400).json({ success: false, message: 'Error while uploading file. Try again later', message_vn: 'File tải lên bị lỗi, Thử lại sau', error });
	}
	res.status(200);
};

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { fileId } = req.params;
		const uploadedFile = req.file;
		if (!uploadedFile) {
			res.status(400).json({ success: false, message: 'No file uploaded', message_vn: 'Không có file nào được tải lên' });
		} else if (!fileId) {
			res.status(400).json({ success: false, message: 'Try again', message_vn: 'Thử lại' });
		} else {
			try {
				const uploadResponse = await uploadFileToStorage('upload', uploadedFile, fileId);
				// logger.debug(NAMESPACE, uploadResponse);
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

/** `[GET]/files/collection/:collectionId`
 * Lấy tất cả các file có trong collection
 * @param req.file
 * Chứa file cần lưu vào collection
 * @param req.params.collectionId
 * chứa id của collection cần tìm file vào
 * @param req.params.articleId
 * chứa id của bài báo cần tìm
 * @returns
 * [200]: Thành công lưu file
 *
 * [409]:
 *
 * [500]:
 */
const getAllFilesInCollection = async (req: Request, res: Response, next: NextFunction) => {
	const { collectionId } = req.params;
	try {
		if (!collectionId || !isValidObjectID(collectionId)) {
			return res.status(400).json({ success: false, message: 'Invalid ID', message_vn: 'ID không hợp lệ' });
		} else {
			MongoFile.find({
				collectionId: collectionId,
			})
				.then((files) => {
					if (files.length > 0) {
						return res.status(200).json({ success: true, data: files, length: files.length });
					} else {
						return res.status(404).json({ success: false, data: null, message: 'There are no file in the database' });
					}
				})
				.catch((error) =>
					res.status(500).json({
						success: false,
						message: error.message,
						e: error,
					}),
				);
		}
	} catch (error: any) {
		res.status(error.statusCode || 500).json({ success: false, message: error.message, error });
	}
};

export default {
	uploadFileToCollection,
	getAllFilesInCollection,
	uploadFile,
};
