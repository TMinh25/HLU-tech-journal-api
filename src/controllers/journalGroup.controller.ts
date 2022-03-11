import { Request, Response } from 'express';
import logger from '../config/logger';
import Journal from '../models/journal.model';
import JournalGroup from '../models/journalGroup.model';
import { getAuthorizationHeaderToken, verifyAccessToken, validObjectID } from '../utils';

const NAMESPACE = 'Journal Group Controller';

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

export default { getAllJournalGroups, newJournalGroup, deleteJournalGroup, modifyJournalGroup, getAllJournalsInGroup };
