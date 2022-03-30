import { Request, Response } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import config from '../config/config';
import logger from '../config/logger';
import Article from '../models/article.model';
import Journal from '../models/journal.model';
import JournalGroup from '../models/journalGroup.model';
import User from '../models/user.model';
import { AttendedRole } from '../types';
import { getAuthorizationHeaderToken, validObjectID, verifyAccessToken } from '../utils';

const { transporter } = config.emailTransporter;
const NAMESPACE = 'Journal Controller';

const getAllJournals = async (req: Request, res: Response) => {
	try {
		const journalRes = await Journal.find().exec();
		if (journalRes.length > 0) {
			res.status(200).json({ success: true, data: journalRes, length: journalRes.length });
		} else {
			res.status(404).json({ success: false, data: null, error: { title: 'Không có số nào trong cơ sở dữ liệu' } });
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
			const recenylyPublishedJournals = journalRes[journalRes.length - 1];
			res.status(200).json({ success: true, data: recenylyPublishedJournals });
		} else {
			return res.status(404).json({ success: false, data: null, message: 'Không có số nào mới được xuất bản' });
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
			return res.status(404).json({ success: false, data: null, error: { title: 'Không có số nào đang xuất bản' } });
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
			return res.status(404).json({ success: false, data: null, error: { title: 'Không có số nào đang xuất bản' } });
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
	const { _journalGroupId } = req.params;
	if (!validObjectID(_journalGroupId)) {
		return res.status(400).json({ success: false, error: { title: 'Invalid ID' } });
	}
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		delete req.body.status;
		const journalGroup = await JournalGroup.findById(_journalGroupId).exec();
		if (!journalGroup) {
			return res.status(400).json({ success: false, message: 'Chuyên san không tồn tại' });
		}
		const journal = new Journal({ ...req.body, createdBy: user, journalGroup: journalGroup });
		logger.debug(NAMESPACE, req.body);
		try {
			await journal.save();
			res.status(201).json({ success: true, data: journal });
		} catch (error: any) {
			logger.error(NAMESPACE, error);
			if (error.name === 'ValidationError') {
				return res.status(400).json({
					success: false,
					message: 'Thông tin trùng lặp trong cơ sở dữ liệu',
					code: 'uniqueValidator',
					error: Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, true])),
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
	if (!validObjectID(journalId)) {
		return res.status(400).json({ success: false, message: 'Invalid ID' });
	}
	if (!journal) {
		return res.status(404).json({ success: false, message: 'Số không tồn tại' });
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
		if (!validObjectID(_id)) {
			return res.status(400).json({ success: false, message: 'Invalid id 3' });
		}
		const journal = await Journal.findById(_id).exec();
		if (!journal) {
			return res.status(404).json({ success: false, message: 'Không tìm thấy số nào' });
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
			return res.status(404).json({ success: false, message: 'Không tìm thấy số nào', found: 0 });
		} else {
			return res.status(200).json({ success: true, data: journals, found: journals.length });
		}
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};
const getAllArticlesOfJournal = async (req: Request, res: Response) => {
	const { _id } = req.params;
	try {
		const journal = await Journal.findById(_id);
		if (!journal) {
			return res.status(404).json({ success: false, message: 'Số không tồn tại' });
		}
		// dùng Promise all để đợi tìm tất cả các article qua articles.map()
		const articles = await Promise.all(
			journal.articles.map(async (articleId: mongoose.Types.ObjectId) => {
				const article = await Article.findById(articleId).exec();
				console.log(article);
				console.log(article?.toObject());
				return article?.toObject();
			}),
		);
		const data = articles.filter((article) => Boolean(article));
		logger.debug(NAMESPACE, articles);
		return res.status(200).json({ success: true, data, length: data.length });
	} catch (error) {
		logger.error(NAMESPACE, error);
	}
};

const addArticleToJournal = async (req: Request, res: Response) => {
	const { _id, _articleId } = req.params;
	if (!validObjectID(_articleId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const journal = await Journal.findById(_id).exec();
		const article = await Article.findById(_articleId).exec();
		if (!article) return res.status(404).json({ success: false, message: 'Bài báo được cập nhật không tồn tại' });
		journal?.articles.push(article?._id);
		article.journal = { _id: journal?._id, name: journal!.name };
		await Promise.all([journal?.save(), article.save()]);
		res.status(200).json({ success: true, message: 'Cập nhật số tạp chí thành công' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const removeArticleToJournal = async (req: Request, res: Response) => {
	const { _id, _articleId } = req.params;
	if (!validObjectID(_articleId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const journal = await Journal.findById(_id).exec();
		const article = await Article.findById(_articleId).exec();
		if (!article) return res.status(404).json({ success: false, message: 'Bài báo được xóa khỏi số tạp chí' });
		journal?.articles.splice(journal.articles.indexOf(_articleId as unknown as ObjectId), 1);
		article.journal = undefined;
		await Promise.all([journal?.save(), article.save()]);
		res.status(200).json({ success: true, message: 'Cập nhật số tạp chí thành công' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const publishedJournal = async (req: Request, res: Response) => {
	const { _id } = req.params;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const journal = await Journal.findById(_id).exec();
		if (!journal) return res.status(404).json({ success: false, message: 'Số tạp chí không tồn tại' });
		journal.status = true;
		await journal?.save();
		res.status(200).json({ success: true, message: 'Cập nhật số tạp chí thành công' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
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
	getAllArticlesOfJournal,
	addArticleToJournal,
	removeArticleToJournal,
	publishedJournal,
};
