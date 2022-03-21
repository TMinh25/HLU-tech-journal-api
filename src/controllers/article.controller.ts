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
import { json } from 'body-parser';
import config from '../config/config';

const NAMESPACE = 'Article Controller';
const { transporter } = config.emailTransporter;

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
		// (nếu bản thảo chưa được hoàn thiện) và (tài khoản không phải editors của số) hoặc (tài khoản không phải tác giả)
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
		// (nếu bản thảo chưa được hoàn thiện) và (tài khoản không phải editors của số) hoặc (tài khoản không phải tác giả)
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
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const author = await User.findById(submission.authors.main._id).exec();
		if (Boolean(Number(accept))) {
			submission.status = ArticleStatus.review;
			submission.contributors?.push();
			transporter.sendMail({
				to: author?.email,
				subject: 'Bài báo của bạn đã được chấp nhận!',
				html: `
				<p>Bài báo ${submission.title} của bạn đã được chấp nhận bởi biên tập viên và bắt đầu quá trình đánh giá bản thảo</p>
				<p>Bạn có thể theo dõi tiến trình đánh giá tại trang cá nhân của bạn hoặc qua đường dẫn sau: 
					<a href="${config.client.url}/author/article/${submission._id}">Chi tiết</a>
				</p>`,
				// html: requestPassword.replace('@username', user.displayName).replace('@reset-link', link),
			});
		} else {
			submission.status = ArticleStatus.reject;
			submission.detail.reject = {
				reason,
				notes,
			};
			submission.detail.review.filter((r) => r.status === ReviewStatus.reviewing || r.status === ReviewStatus.request).forEach((r) => (r.status = ReviewStatus.unassigned));
			transporter.sendMail({
				to: author?.email,
				subject: 'Bài báo của bạn đã bị từ chối biên tập!',
				html: `
				<p>Bài báo ${submission.title} của bạn đã bị từ chối bởi biên tập viên của hệ thống</p>
				<p>Với lí do: ${reason}</p>
				<p>Ghi chú: ${notes}</p>
				<br>
				<p><a href="${config.client.url}/author/article/${submission._id}">Chi tiết</a></p>`,
				// html: requestPassword.replace('@username', user.displayName).replace('@reset-link', link),
			});
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
		const userReviewer = await User.findById(reviewer).exec();
		/** Gửi mail cho phản biện */
		transporter.sendMail({
			to: userReviewer?.email,
			subject: `Bạn được mời làm phản biện một bài báo`,
			html: `<p>Bản thảo <i>${submission.title}</i> đã được giao cho bạn để đánh giá. </p><a href="${config.client.url}/reviewer/article/${submission._id}">Hãy vào hệ thống để xem thông tin</a>`,
		});
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
		if (index === -1) return res.status(404).json({ success: false, message: 'Đánh giá không tồn tại' });
		submission.detail.review[index].status = ReviewStatus.unassigned;
		const result = await submission.save();
		res.status(200).json({ success: true, message: 'Đánh giá đã được gỡ', data: result });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const reviewerResponse = async (req: Request, res: Response) => {
	const { _id, _roundId } = req.params;
	const { status } = req.query;
	const { reason, notes } = req.body;
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
		} else if (status == 'reject') {
			submission.detail.review.at(index)!.status = ReviewStatus.requestRejected;
			submission.detail.review.at(index)!.reject!.reason = reason?.toString() || '';
			submission.detail.review.at(index)!.reject!.notes = notes?.toString() || '';
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
		const reviewer = await User.findById(submission.detail.review.at(index)!.reviewer).exec();
		// nullish assignment
		if (!!Number(confirm)) {
			submission.detail.review.at(index)!.status = ReviewStatus.confirmed;
			transporter.sendMail({
				to: reviewer?.email,
				subject: `Đánh giá đã được chấp nhận`,
				html: `<p>Đánh giá của bạn đã được xem xét và chấp nhận bởi ban biên tập</p>`,
			});
		} else {
			submission.detail.review.at(index)!.status = ReviewStatus.denied;
			transporter.sendMail({
				to: reviewer?.email,
				subject: `Đánh giá đã bị từ chối`,
				html: `<p>Cảm ơn bạn đã hỗ trợ chúng tôi trong quá trình đánh giá bản thảo. </p><p>Tuy nhiên chúng tôi thấy rằng đánh giá của bạn vẫn chưa phù hợp với yêu cầu của chúng tôi. Vì vậy đánh giá của bạn đã bị từ chối và tác giả sẽ không có khả năng xem xét đánh giá của bạn</p>`,
			});
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

const requestRevision = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const { text, files } = req.body;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });

		submission.detail.publishing?.request.push({
			files,
			text,
			responseFile: undefined,
		});
		await submission.save();
		const author = await User.findById(submission.authors.main._id).exec();
		transporter.sendMail({
			to: author?.email,
			subject: `Hãy hoàn thiện bài báo nào!`,
			html: `
			<p>Bài báo của bạn đang cần hoàn thiện trong lúc này </p>
			<p>Hãy hoàn thiện bài báo và <a href="${config.client.url}/author/article/${submission._id}">nộp lại</a> cho ban biên tập nào</p>`,
		});
		res.status(200).json({ success: true, message: `Đã yêu cầu tác giả hoàn thiện bài báo` });
	} catch (error) {
		logger.error(NAMESPACE, error);
		res.status(500).json({ success: false, error });
	}
};

const responseRevision = async (req: Request, res: Response) => {
	const { _id, _revisionId } = req.params;
	const { responseFile } = req.body;
	if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'Invalid ID' });
	try {
		const submission = await Article.findById(_id).exec();
		if (!submission) return res.status(404).json({ success: false, message: 'Bản thảo không tồn tại' });
		const revisionIndex = submission.detail.publishing?.request.findIndex((r) => r._id === _revisionId);
		if (revisionIndex === -1 && submission.detail.publishing?.request.at(revisionIndex) == undefined) return res.status(404).json({ success: false, message: 'Invalid ID' });
		// const revision = `detail.publishing.request.${_revisionId}.responseFile`;

		const result = await Article.updateOne(
			{ _id: _id },
			{
				$set: {
					'detail.publishing.request.$[requests].responseFile': responseFile,
				},
			},
			{
				arrayFilters: [
					{
						'requests._id': _revisionId,
					},
				],
			},
		).exec();
		await submission.save();
		const author = await User.findById(submission.authors.main._id).exec();
		transporter.sendMail({
			to: author?.email,
			subject: `Cảm ơn bạn đã hoàn thiện bài báo!`,
			html: `
			<p>Bài báo hoàn thiện của bạn đang được ban biên tập xem xét </p>
			<p>Hãy cùng chờ đợi xem bài báo của bạn có được xuất bản không nhé.</p>
			<p>
				<a href="${config.client.url}/author/article/${submission._id}">Chi tiết bài báo</a>
			</p>`,
		});
		res.status(200).json({ success: true, message: `Nộp tài liệu hoàn thiện của bài báo thành công` });
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
		const author = await User.findById(submission.authors.main._id).exec();
		transporter.sendMail({
			to: author?.email,
			subject: `Bài báo đã xuất bản!`,
			html: `
			<p>Bài báo ${submission.title} của bạn đã được xuất bản rồi</p>
			<p>Hãy xem bài báo của bạn có được nhiều người đón nhận không nhé. </p>
			<p>
				<a href="${config.client.url}/author/article/${submission._id}">Chi tiết bài báo</a>
			</p>`,
		});
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
	requestRevision,
	responseRevision,
};

//TODO: tạo articleController
