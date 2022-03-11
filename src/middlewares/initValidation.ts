import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const mongoDbInitValidation = (req: Request, res: Response, next: NextFunction) => {
	switch (mongoose.connection.readyState) {
		case 0:
			return res.status(500).json({
				success: false,
				readyState: 'disconnected',
				message: 'Mất kết nối với cơ sở dữ liệu!',
			});
		case 1:
			return next();
		case 2:
			return res.status(500).json({
				success: false,
				readyState: 'connecting',
				message: 'Đang kết nối cơ sở dữ liệu!',
			});
		case 3:
			return res.status(500).json({
				success: false,
				readyState: 'disconnecting',
				message: 'Đang ngắt kết nối cơ sở dữ liệu!',
			});
		default:
			// pass to next function
			return next();
	}
};

export { mongoDbInitValidation };
