import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import Journal from '../models/journal.model';
import { getAuthorizationHeaderToken, isValidObjectID, verifyAccessToken } from '../utils';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import logger from '../config/logger';
import config from '../config/config';
import Article from '../models/article.model';

const NAMESPACE = 'Journal Controller';

const getAllJournals = async (req: Request, res: Response) => {
	try {
		const journalRes = await Journal.find().exec();
		if (journalRes.length > 0) {
			res.status(200).json({ success: true, data: journalRes, length: journalRes.length });
		} else {
			res.status(404).json({ success: false, data: null, error: { title: 'Không có tạp chí nào trong cơ sở dữ liệu' } });
		}
	} catch (error: any) {
		logger.error(NAMESPACE, error);
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const getRecentlyPublishedJournal = async (req: Request, res: Response) => {
	try {
		const journalRes = await Journal.find({ status: true }).exec();
		if (journalRes.length > 0) {
			const recenylyPublishedJournals = journalRes.slice(Math.max(journalRes.length - 5, 0));
			res.status(200).json({ success: true, data: recenylyPublishedJournals, length: recenylyPublishedJournals.length });
		} else {
			return res.status(404).json({ success: false, data: null, error: { title: 'Không có tạp chí nào mới được xuất bản' } });
		}
	} catch (error: any) {
		logger.error(NAMESPACE, error);
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const getAllPublishingJournal = async (req: Request, res: Response) => {
	try {
		const publishingJournals = await Journal.find({ status: false }).exec();
		if (publishingJournals.length > 0) {
			res.status(200).json({ success: true, data: publishingJournals, length: publishingJournals.length });
		} else {
			return res.status(404).json({ success: false, data: null, error: { title: 'Không có tạp chí nào đang xuất bản' } });
		}
	} catch (error: any) {
		logger.error(NAMESPACE, error);
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const getAllPublishedJournal = async (req: Request, res: Response) => {
	try {
		const publishedJournals = await Journal.find({ status: true }).exec();
		if (publishedJournals.length > 0) {
			res.status(200).json({ success: true, data: publishedJournals, length: publishedJournals.length });
		} else {
			return res.status(404).json({ success: false, data: null, error: { title: 'Không có tạp chí nào đang xuất bản' } });
		}
	} catch (error: any) {
		logger.error(NAMESPACE, error);
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const createNewJournal = async (req: Request, res: Response) => {
	// req.body;
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		delete req.body.status;
		const journal = new Journal({ ...req.body, createdBy: user });
		logger.debug(NAMESPACE, req.body);
		try {
			await journal.save();
			res.status(201).json({ success: true, data: journal });
		} catch (error: any) {
			logger.error(NAMESPACE, error);
			if (error.name === 'ValidationError') {
				return res.status(500).json({
					success: false,
					error: { title: 'Thông tin trùng lặp tồn tại trong cơ sở dữ liệu', ...error },
				});
			}
			return res.status(500).json({
				success: false,
				message: error.message,
				error,
			});
		}
	} catch (error) {
		if (error === 'expired') {
			return res.status(401).json({ success: false, error: { title: 'Phiên hết hạn', description: 'Hãy đăng nhập lại' } });
		} else if (error === 'notfound') {
			return res.status(404).json({ success: false, error: { title: 'Không thể tìm thấy người dùng' } });
		} else {
			return res.status(500);
		}
	}
};

const deleteJournal = async (req: Request, res: Response) => {
	const journalId = req.params._id;
	const journal = await Journal.findById(journalId).exec();
	if (!isValidObjectID(journalId)) {
		return res.status(400).json({ success: false, message: 'Invalid id 2' });
	}
	if (!journal) {
		return res.status(404).json({ success: false, message: 'Tạp chí không tồn tại' });
	} else {
		try {
			await journal.remove();
			res.status(200).json({ success: true });
		} catch (error) {
			logger.error(NAMESPACE, error);
			res.status(500).json({ success: false, error });
		}
	}
};

// TODO: chỉnh sửa thông tin Journal
const getJournalById = async (req: Request, res: Response) => {
	const { _id } = req.params;
	try {
		if (!isValidObjectID(_id)) {
			return res.status(400).json({ success: false, message: 'Invalid id 3' });
		}
		const journal = await Journal.findById(_id).exec();
		if (!journal) {
			return res.status(404).json({ success: false, message: 'Không tìm thấy tạp chí nào' });
		} else {
			return res.status(200).json({ success: true, data: journal });
		}
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const findJournals = async (req: Request, res: Response) => {
	const { name, editors, tags } = req.body;
	try {
		const journals = await Journal.find({
			$or: [
				{ name: RegExp(name, 'i') },
				// , { editors: editors }, { $and: [{ tags: { $all: tags } }, { tags: { $size: tags.length } }] }
			],
		});
		if (!journals) {
			return res.status(404).json({ success: false, message: 'Không tìm thấy tạp chí nào', found: 0 });
		} else {
			return res.status(200).json({ success: true, data: journals, found: journals.length });
		}
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const articleSubmissions = async (req: Request, res: Response) => {
	logger.debug(NAMESPACE, req.body);
	const accessToken = getAuthorizationHeaderToken(req);
	const articleInfo = req.body;
	const journalId = req.params._id;
	try {
		const user = await verifyAccessToken(accessToken);
		delete articleInfo.status;
		const newSubmission = new Article({ articleInfo });
		newSubmission.authors.main = user._id;
		const journal = await Journal.findById(journalId).exec();
		if (!journal) {
			return res.status(404).json({ success: false, message: 'Tạp chí không tồn tại' });
		}
		journal.articles.push(newSubmission._id);
		await journal.save();
		res.status(201).json({ success: true, data: newSubmission });
	} catch (error) {
		if (error === 'expired') {
			return res.status(401).json({ success: false, error: { title: 'Phiên hết hạn', description: 'Hãy đăng nhập lại' } });
		} else if (error === 'notfound') {
			return res.status(404).json({ success: false, error: { title: 'Không thể tìm thấy người dùng' } });
		} else {
			logger.error(NAMESPACE, error);
			return res.status(500);
		}
	}
};

export default {
	getAllJournals,
	getJournalById,
	getRecentlyPublishedJournal,
	getAllPublishingJournal,
	getAllPublishedJournal,
	createNewJournal,
	deleteJournal,
	findJournals,
	articleSubmissions,
};
