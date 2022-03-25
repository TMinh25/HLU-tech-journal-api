import { Request, Response } from 'express';
import config from '../config/config';
import logger from '../config/logger';
import Article from '../models/article.model';
import Journal from '../models/journal.model';
import JournalGroup from '../models/journalGroup.model';
import User from '../models/user.model';
import { getAuthorizationHeaderToken, verifyAccessToken, validObjectID } from '../utils';

const NAMESPACE = 'Journal Group Controller';
const { transporter } = config.emailTransporter;

const createDefaultJournalGroups = async () => {
	try {
		const [normal, special] = await Promise.all([JournalGroup.findOne({ name: 'SỐ THƯỜNG' }).exec(), JournalGroup.findOne({ name: 'SỐ ĐẶC BIỆT' }).exec()]);

		if (!normal) {
			const normalJournal = new JournalGroup({ name: 'SỐ THƯỜNG', tags: ['SỐ THƯỜNG'] });
			normalJournal.save();
		}
		if (!special) {
			const specialJournal = new JournalGroup({ name: 'SỐ ĐẶC BIỆT', tags: ['SỐ ĐẶC BIỆT'] });
			specialJournal.save();
		}
	} catch (error) {
		logger.error(NAMESPACE, error);
	}
};

const getAllJournalGroups = async (req: Request, res: Response) => {
	try {
		const allJournals = await JournalGroup.find().exec();
		if (!allJournals.length) {
			return res.status(404).json({ success: false, error: { title: 'Không tìm thấy chuyên san nào' } });
		}
		res.status(200).json({ success: true, data: allJournals, length: allJournals.length });
	} catch (error) {
		logger.error(NAMESPACE, error);
		return res.status(500).json({ success: false, error });
	}
};

const newJournalGroup = async (req: Request, res: Response) => {
	const journalGroup = new JournalGroup(req.body);
	const accessToken = getAuthorizationHeaderToken(req);
	try {
		const user = await verifyAccessToken(accessToken);
		journalGroup.createBy = { _id: user._id, at: new Date() };
		await journalGroup.save();
		res.status(201).json({ success: true, data: journalGroup });
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
		if (error === 'expired') {
			return res.status(401).json({ success: false, error: { title: 'Phiên hết hạn', description: 'Hãy đăng nhập lại' } });
		} else if (error === 'notfound') {
			return res.status(404).json({ success: false, error: { title: 'Không thể tìm thấy người dùng' } });
		} else {
			return res.status(500).json({
				success: false,
				message: error.message,
				error,
			});
		}
	}
};

const modifyJournalGroup = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const { name, tags } = req.body;
	if (!validObjectID(_id)) {
		return res.status(400).json({ success: false, error: { title: 'Invalid ID' } });
	}
	try {
		const journalGroup = await JournalGroup.findById(_id);
		if (!journalGroup) {
			return res.status(404).json({ success: false, error: { title: 'Không tìm thấy chuyên san nào' } });
		}
		journalGroup.name = name;
		journalGroup.tags = tags;
		await journalGroup.save();
		res.status(200).json({ success: true, data: journalGroup });
	} catch (error) {
		logger.error(NAMESPACE, error);
		return res.status(500).json({ success: false, error });
	}
};

const deleteJournalGroup = async (req: Request, res: Response) => {
	const { _id } = req.params;
	if (!validObjectID(_id)) {
		return res.status(400).json({ success: false, error: { title: 'Invalid ID' } });
	}
	JournalGroup.findByIdAndDelete(_id, (err: any, docs: any) => {
		if (err) {
			return res.status(500).json({ success: false, error: err });
		} else {
			console.log(docs);
			return res.status(200).json({ success: true });
		}
	});
};

const getAllJournalsInGroup = async (req: Request, res: Response) => {
	const { _id } = req.params;
	try {
		const journalRes = await Journal.find({ 'journalGroup._id': _id }).exec();
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

const articleSubmissions = async (req: Request, res: Response) => {
	const accessToken = getAuthorizationHeaderToken(req);
	const articleInfo = req.body;
	const { _id } = req.params;
	try {
		const user = await verifyAccessToken(accessToken);
		const journalGroup = await JournalGroup.findById(_id).exec();
		if (!journalGroup) return res.status(404).json({ success: false, message: 'Chuyên san không tồn tại' });
		delete articleInfo.status;
		delete articleInfo.files;
		delete articleInfo.reviewer;
		const newSubmission = new Article(articleInfo);
		newSubmission.authors.main = {
			_id: user._id,
			displayName: user.displayName,
			email: user.email,
			workPlace: user.workPlace,
			backgroundInfomation: user.backgroundInfomation,
			photoURL: user.photoURL,
		};
		newSubmission.journalGroup = { _id: journalGroup._id, name: journalGroup.name };
		newSubmission.files?.push(articleInfo.detail.submission.file);
		newSubmission.files?.push(...articleInfo.detail.submission.helperFiles);
		newSubmission.currentFile = articleInfo.detail.submission.file;
		journalGroup.submissions.push(newSubmission._id);
		try {
			const [newSubmissionData, journalGroupData] = await Promise.all([newSubmission.save(), journalGroup.save()]);
			const author = await User.findById(newSubmission.authors.main._id).exec();
			transporter.sendMail({
				to: author?.email,
				subject: `Bài báo của bạn đã được nộp thành công!`,
				html: `
					<p>Cảm ơn bạn đã lựa chọn Số Khoa học Đại học Hạ Long làm nơi nộp bản thảo!</p>
					<p>Bài báo ${newSubmission.title} của bạn đã nộp rồi.</p>
					<p>Bài báo đã và đang được các biên tập viên xem xét.</p>
					<p>
						<a href="${config.client.url}/author/article/${newSubmission._id}">Chi tiết bài báo</a>
					</p>`,
			});
			return res.status(201).json({ success: true, data: newSubmissionData });
		} catch (error: any) {
			logger.error(NAMESPACE, error);
			if (error.name === 'ValidationError') {
				if (error.kind === 'unique') {
					return res.status(400).json({
						success: false,
						message: 'Thông tin trùng lặp trong cơ sở dữ liệu',
						code: 'uniqueValidator',
						error: Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, true])),
					});
				} else if (error.kind === 'required') {
					return res.status(400).json({
						success: false,
						message: 'Thông tin cần nhập bị thiếu',
						code: 'requiredValidator',
						error: Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, true])),
					});
				}
			}
			return res.status(500).json({ success: false, error });
		}
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

export default { getAllJournalGroups, newJournalGroup, deleteJournalGroup, modifyJournalGroup, getAllJournalsInGroup, createDefaultJournalGroups, articleSubmissions };
