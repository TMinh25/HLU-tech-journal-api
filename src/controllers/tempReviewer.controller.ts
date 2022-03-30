import { Request, Response } from 'express';
import TempReviewer from '../models/tempReviewer.model';
import User from '../models/user.model';
import { validObjectID } from '../utils';

const getAllTempReviewers = async (req: Request, res: Response) => {
	try {
		const allResults = await TempReviewer.find().exec();
		if (allResults.length > 0) {
			res.status(200).json({
				success: true,
				data: allResults,
				length: allResults.length,
			});
		} else {
			res.status(404).json({ success: false, data: null, error: { title: 'Không có phản biện nào trong cơ sở dữ liệu' } });
		}
	} catch (error: any) {
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const newTempReviewer = async (req: Request, res: Response) => {
	const { displayName, email, tags } = req.body;
	console.log(req.body);
	if (!displayName || !email) return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin' });
	try {
		const isValidEmail = (await TempReviewer.exists({ email })) || (await User.exists({ email }));
		if (isValidEmail) return res.status(400).json({ success: false, message: `Tài khoản hoặc phản biện có email ${email} đã tồn tại!` });
		const reviewer = new TempReviewer({ displayName, email, tags });
		await reviewer.save();
		res.status(200).json({ success: true, data: reviewer });
	} catch (error: any) {
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

const removeTempReviewer = async (req: Request, res: Response) => {
	const { _id } = req.params;
	try {
		if (!validObjectID(_id)) return res.status(400).json({ success: false, message: 'invalid ID' });
		TempReviewer.findByIdAndRemove(_id, (err: any, doc: any) => {
			if (err) {
				return res.status(500).json({ success: false });
			}
			res.status(200).json({ success: true });
		});
	} catch (error: any) {
		res.status(500).json({
			success: false,
			error: {
				title: error.message,
				error,
			},
		});
	}
};

export default { getAllTempReviewers, newTempReviewer, removeTempReviewer };
