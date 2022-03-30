import { NextFunction, Request, Response } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from '../config/config';
import logger from '../config/logger';
import { getAuthorizationHeaderToken } from '../utils';

const { jwtKey } = config;

const NAMESPACE = 'TokenAuthorization';

export const tokenAuthorization = async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = getAuthorizationHeaderToken(req);
	if (accessToken) {
		if (accessToken == null) return res.status(401).json({ success: false, message_vn: 'Token không hợp lệ', message: 'Invalid token' });
		// logger.debug(NAMESPACE, accessToken);
		jwt.verify(
			accessToken,
			jwtKey,
			{
				algorithms: ['HS512', 'HS256'],
			},
			(error, user) => {
				if (error) {
					if (error.name === TokenExpiredError.name) {
						return res.status(401).json({ success: false, error: { title: 'Phiên hết hạn' } });
					}
					logger.debug(NAMESPACE, error);
					return res.status(401).json({ success: false, error: { title: 'Phiên lỗi!' } });
				}
				// logger.debug(NAMESPACE, 'token valid, moving to next function');
				// req.body.token = accessToken;
				next();
			},
		);
	} else {
		return res.status(401).json({
			success: false,
			message: 'Bạn chưa đăng nhập',
			description: {
				es: 'Truyền token vào trong Request Header - Authorization: "Bearer {token}"',
				vn: 'Pass token to Request Header - Authorization: "Bearer {token}"',
			},
		});
	}
};
