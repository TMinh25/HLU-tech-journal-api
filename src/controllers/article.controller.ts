import { Request, Response } from 'express';
import { getStreamInstance } from '../app';
import logger from '../config/logger';
import Article from '../models/article.model';
import Journal from '../models/journal.model';
import User from '../models/user.model';
import { ArticleStatus, AttendedRole, ReviewStatus } from '../types';
import { getAuthorizationHeaderToken, validObjectID, verifyAccessToken } from '../utils';
import notificationController from './notification.controller';
import mongoose from 'mongoose';

const NAMESPACE = 'Article Controller';

const getAllArticles = async (req: Request, res: Response) => {
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		const journals = await Journal.find({ 'editors._id': user._id }).exec();
		const allArticlesIds = journals.map((j) => j.articles).flat();
		const data = await Promise.all(allArticlesIds.map(async (a) => await Article.findById(a).exec()));
		if (data.length == 0) return res.status(404).json({ success: true, data });
		res.status(200).json({ success: true, data: data.filter((a) => Boolean(a)) });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const getArticles = async (req: Request, res: Response) => {
	const ids: Array<string> = req.body;
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		const articles = await Promise.all(ids.map(async (id) => await Article.findById(id).exec()));
		if (!user) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
		if (!articles || articles.length === 0) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		// (nếu bản thảo chưa được hoàn thiện) và (tài khoản không phải editors của tạp chí) hoặc (tài khoản không phải tác giả)
		return res.status(200).json({ success: true, data: articles });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const getArticle = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		const article = await Article.findById(_id).exec();
		if (!user) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập' });
		if (!article) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const journal = await Journal.findById(article?.journal._id).exec();
		// (nếu bản thảo chưa được hoàn thiện) và (tài khoản không phải editors của tạp chí) hoặc (tài khoản không phải tác giả)
		if (article.status !== ArticleStatus.completed && journal!.editors.includes({ _id: user._id, name: user.displayName }) && article.authors.main._id !== user._id) {
			return res.status(401).json({ success: false, message: 'Bạn không có quyền xem bản thảo này' });
		}

		return res.status(200).json({ success: true, data: article });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const getArticlesForReviewer = async (req: Request, res: Response) => {
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		const data = await Article.find({ 'detail.review.reviewer': user._id }).exec();
		if (data.length == 0) return res.status(404).json({ success: true, data: data });
		res.status(200).json({ success: true, data: data });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const getArticlesForAuthor = async (req: Request, res: Response) => {
	const { _userId } = req.params;
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await User.findById(_userId).exec();
		if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
		const data = await Article.find({ 'authors.main._id': user._id }).exec();
		if (data.length == 0) return res.status(404).json({ success: true, data: data });
		res.status(200).json({ success: true, data: data });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const submissionResponse = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const { accept } = req.query;
	const { reason, notes } = req.body;
	const accessToken = getAuthorizationHeaderToken(req);
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const editor = await verifyAccessToken(accessToken);
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		if (Boolean(Number(accept))) {
			const author = await User.findById(submission.authors.main._id).exec();
			submission.status = ArticleStatus.review;
			submission.contributors?.push();
		} else {
			submission.status = ArticleStatus.reject;
			submission.detail.reject = {
				reason,
				notes,
			};
			submission.detail.review.filter((r) => r.status === ReviewStatus.reviewing || r.status === ReviewStatus.request).forEach((r) => (r.status = ReviewStatus.unassigned));
		}
		const data = await submission.save();
		res.status(200).json({ success: true, data });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const requestReviewer = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const { importantDates, reviewer, displayFile, files, guideLines } = req.body;
	const accessToken = getAuthorizationHeaderToken(req);
	if (!importantDates || !reviewer || !displayFile) return res.status(400).json({ success: false, message: 'Chưa đủ dữ liệu!' });
	if (!validObjectID(_id) && !validObjectID(reviewer)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		const requestedReviewer = await User.findById(reviewer).exec();
		const editor = await verifyAccessToken(accessToken);
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		if (!requestedReviewer) return res.status(404).json({ success: false, message: 'Phản biện không tồn tại' });
		// const chatId = mongoose.Types.ObjectId();
		getStreamInstance.channel('messaging', {
			members: [reviewer, editor._id],
		});
		submission.detail?.review.push({ ...{ importantDates, reviewer, displayFile, files, guideLines }, editor: editor._id, status: ReviewStatus.request });
		await notificationController.submissionSentToReviewer(submission, requestedReviewer);
		const result = await submission.save();
		res.status(200).json({ success: true, message: 'Bản thảo đã được gửi đến phản biện', data: result });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const unassignReviewStage = async (req: Request, res: Response) => {
	const { _id, _roundId } = req.params;
	if (!validObjectID(_id) || !validObjectID(_roundId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const index = submission.detail.review.findIndex((r) => r._id!.toString() === _roundId);
		if (index === -1) return res.status(404).json({ success: false, message: 'Vòng phản biện không tồn tại' });
		submission.detail.review[index].status = ReviewStatus.unassigned;
		const result = await submission.save();
		res.status(200).json({ success: true, message: 'Vòng phản biện đã được gỡ', data: result });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const reviewerResponse = async (req: Request, res: Response) => {
	const { _id, _roundId } = req.params;
	const { status } = req.query;
	if (!status) return res.status(400).json({ success: false, message: 'Chưa đủ dữ liệu' });
	const accessToken = getAuthorizationHeaderToken(req);
	if (!validObjectID(_id) || !validObjectID(_roundId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const user = await verifyAccessToken(accessToken);
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });

		const index = submission.detail.review.findIndex((r) => r._id!.toString() === _roundId);
		if (index === -1) return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại!' });
		// nullish assignment
		if (status == 'accept') {
			submission.detail.review.at(index)!.status = ReviewStatus.reviewing;
			await notificationController.reviewerAcceptSubmission(submission, user);
		} else if (status == 'reject') {
			submission.detail.review.at(index)!.status = ReviewStatus.requestRejected;
			await notificationController.reviewerRejectSubmission(submission, user);
		}
		await submission.save();
		res.status(200).json({ success: true, message: 'Cảm ơn phản hồi của bạn!' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const reviewerSubmitResult = async (req: Request, res: Response) => {
	const { _id, _roundId } = req.params;
	const result = req.body;
	if (!validObjectID(_id) || !validObjectID(_roundId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		// const user = await verifyAccessToken(accessToken);
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const index = submission.detail.review.findIndex((r) => r._id!.toString() === _roundId);
		if (index === -1) return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại!' });
		// nullish assignment
		submission.detail.review.at(index)!.status = ReviewStatus.reviewSubmitted;
		submission.detail.review.at(index)!.result = result;
		// await notificationController.reviewerAcceptSubmission(submission, user);
		await submission.save();
		res.status(200).json({ success: true, message: 'Cảm ơn phản hồi của bạn!' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const confirmedSubmittedResult = async (req: Request, res: Response) => {
	const { _id, _roundId } = req.params;
	const { confirm } = req.query;
	if (!validObjectID(_id) || !validObjectID(_roundId)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		// const user = await verifyAccessToken(accessToken);
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const index = submission.detail.review.findIndex((r) => r._id!.toString() === _roundId);
		if (index === -1) return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại!' });
		// nullish assignment
		if (!!Number(confirm)) {
			submission.detail.review.at(index)!.status = ReviewStatus.confirmed;
		} else {
			submission.detail.review.at(index)!.status = ReviewStatus.denied;
		}
		await submission.save();
		res.status(200).json({ success: true, message: `Đã ${!!Number(confirm) ? 'chấp nhận' : 'từ chối'} đánh giá của phản biện!` });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const publishingArticle = async (req: Request, res: Response) => {
	const { _id } = req.params;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		submission.status = ArticleStatus.publishing;
		submission.detail.publishing = req.body;
		submission.detail.review.filter((r) => r.status === ReviewStatus.reviewing || r.status === ReviewStatus.request).forEach((r) => (r.status = ReviewStatus.unassigned));
		console.log(submission.detail.review);
		await submission.save();
		res.status(200).json({ success: true, message: `Bản thảo chuyển sang bước xuất bản!` });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const completeArticle = async (req: Request, res: Response) => {
	const { _id } = req.params;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		submission.status = ArticleStatus.completed;
		submission.publishedFile = req.body.publishedFile;
		submission.publishedAt = new Date();
		await submission.save();
		res.status(200).json({ success: true, message: `Quá trình xuất bản bài báo hoàn tất!` });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const toggleVisibleArticle = async (req: Request, res: Response) => {
	const { _id } = req.params;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		await submission.update({ visible: !submission.visible }).exec();
		res.status(200).json({ success: true, message: 'Cập nhật bài báo thành công' });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

export default {
	getAllArticles,
	getArticle,
	getArticles,
	requestReviewer,
	reviewerResponse,
	unassignReviewStage,
	submissionResponse,
	reviewerSubmitResult,
	getArticlesForReviewer,
	getArticlesForAuthor,
	confirmedSubmittedResult,
	publishingArticle,
	completeArticle,
	toggleVisibleArticle,
};

//TODO: tạo articleController
