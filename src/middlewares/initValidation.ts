import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const mongoDbInitValidation = (req: Request, res: Response, next: NextFunction) => {
	switch (mongoose.connection.readyState) {
		case 0:
			return res.status(500).json({
				success: false,
				readyState: 'disconnected',
				error: {
					title: 'Mất kết nối với cơ sở dữ liệu!',
					description: 'MongoDB đã ngắt kết nối, thử lại sau khi MongoDB được kết nối',
				},
			});
		case 1:
			return next();
		case 2:
			return res.status(500).json({
				success: false,
				readyState: 'connecting',
				error: {
					title: 'Đang kết nối cơ sở dữ liệu!',
					description: 'MongoDB đang kết nối',
				},
			});
		case 3:
			return res.status(500).json({
				success: false,
				readyState: 'disconnecting',
				error: {
					title: 'Đang ngắt kết nối cơ sở dữ liệu!',
					description: 'MongoDB đang ngắt kết nối, hãy thử lại',
				},
			});
		default:
			// pass to next function
			return next();
	}
};

export { mongoDbInitValidation };
