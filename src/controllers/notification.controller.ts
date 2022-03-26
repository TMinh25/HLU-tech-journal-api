import { Response, Request } from 'express';
import Notification from '../models/notification.model';

const getAllNotifications = async (req: Request, res: Response) => {
	const notifications = await Notification.find().exec();
	res.status(200).json({ success: true, data: notifications });
};
const newNotification = async (req: Request, res: Response) => {
	try {
		const { title, content } = req.body;
		const notification = new Notification({ title, content });
		await notification.save();
		res.status(200).json({ success: true, message: 'Thông báo mới đã được đẩy lên hệ thống' });
	} catch (error) {
		res.status(500).json({ success: false });
	}
};

export default { getAllNotifications, newNotification };
