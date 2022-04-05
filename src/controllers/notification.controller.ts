import { Response, Request } from 'express';
import Notification from '../models/notification.model';

const getNotification = async (req: Request, res: Response) => {
	const { _id } = req.params;
	const notification = await Notification.findById(_id).lean().exec();
	if (!notification) return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo!' });
	res.status(200).json({ success: true, data: notification });
};

const getAllNotifications = async (req: Request, res: Response) => {
	const notifications = await Notification.find().exec();
	res.status(200).json({ success: true, data: notifications.reverse() });
};

const newNotification = async (req: Request, res: Response) => {
	try {
		let { title, content, detail } = req.body;
		if (!detail) detail = content;
		const notification = new Notification({ title, content });
		await notification.save();
		res.status(200).json({ success: true, message: 'Thông báo mới đã được đẩy lên hệ thống' });
	} catch (error) {
		res.status(500).json({ success: false });
	}
};

export default { getNotification, getAllNotifications, newNotification };
