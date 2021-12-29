import { NextFunction, Request, Response } from 'express';
import logger from '../config/logger';
import path from 'path';
import MongoFile from '../models/file.model';
import { isValidObjectID, BASEDIR } from '../utils';
import config from '../config/config';

const NAMESPACE = 'FileStorageController';

/** `[POST]/files/uploads?collection=collectionId`
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
		const { description } = req.body;
		const { collectionId } = req.params;
		if (req.file !== undefined) {
			const { path, mimetype, originalname } = req.file;
			const file = new MongoFile({
				_id: req.query.fileId,
				title: originalname,
				description,
				file_path: path,
				file_mimetype: mimetype,
				collectionId,
			});
			const fileSaveResponse = await file.save();
			res.status(200).json({ success: true, message: 'File uploaded successfully', message_vn: 'File tải lên thành công', data: fileSaveResponse });
		} else if (!req.file) {
			res.status(400).json({ success: false, message: 'No file uploaded', message_vn: 'Không có file nào được tải lên' });
		}
	} catch (error) {
		res.status(400).json({ success: false, message: 'Error while uploading file. Try again later', message_vn: 'File tải lên bị lỗi, Thử lại sau', error });
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

const downloadFile = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const file = await MongoFile.findById(req.params.articleId);
		if (file) {
			res.set({
				'Content-Type': file.file_mimetype,
			});
			// res.sendFile(path.join(__dirname, '..', file.file_path));
			const filePath = path.resolve(BASEDIR + '\\' + file.file_path);
			res.sendFile(filePath);
		} else if (!file) {
			res.status(404).json({ success: false, message: 'File not found', message_vn: 'Không tìm thấy file' });
		}
	} catch (error) {
		res.status(400).send({ success: false, message: 'Error while downloading file. Try again later.', message_vn: 'Có lỗi khi đang tải file. Thử lại sau' });
	}
};

export default { uploadFileToCollection, getAllFilesInCollection, downloadFile };
