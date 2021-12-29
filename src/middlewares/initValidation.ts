import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const mongoDbInitValidation = (req: Request, res: Response, next: NextFunction) => {
	switch (mongoose.connection.readyState) {
		case 0:
			return res.status(500).json({
				success: false,
				readyState: 'disconnected',
				message: 'MongoDB is disconnected, try again when MongoDB is connected',
				message_vn: 'MongoDB đã ngắt kết nối, thử lại sau khi MongoDB được kết nối',
			});
		case 1:
			return next();
		case 2:
			return res.status(500).json({
				success: false,
				readyState: 'connecting',
				message: 'MongoDB is connecting, please wait',
				message_vn: 'MongoDB đang kết nối, vui lòng đợi',
			});
		case 3:
			return res.status(500).json({
				success: false,
				readyState: 'disconnecting',
				message: 'MongoDB is disconnecting, try again',
				message_vn: 'MongoDB đang ngắt kết nối, hãy thử lại',
			});
		default:
			// pass to next function
			return next();
	}
};

export { mongoDbInitValidation };
