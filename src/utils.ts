import bson from 'bson';
import { Request } from 'express';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import moment from 'moment-timezone';
import mongo from 'mongodb';
import mongoose from 'mongoose';
import path from 'path';
import config from './config/config';
import IUser from './interfaces/user';
import User from './models/user.model';

/** Regex của các chữ cái viết hoa (tiếng việt) */
const vietnameseUpperCaseRegex = /[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ]/g;

/** Regex của ngày tháng năm
 * @example
 * ``` Mar 05, 2021 ```
 */
const datetimeRegex =
	/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May?|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:vember)?|Dec(?:ember)?|Dec(?:ember)?) ([0-9]{2}?), ([0-9]{4}?)/g;

/** Regex của các trích dẫn
 * @example
 * ``` [1], [2] ```
 */
const citationRegex = /\[[0-9][1-9]?\]/g;

/**
 *  Kiểm tra xem giá trị [id] truyền vào có thuộc định dạng của ObjectId trong mongo không
 */
export const validObjectID = (id: string | mongoose.ObjectId | bson.ObjectId | mongo.ObjectId): boolean => {
	return mongoose.Types.ObjectId.isValid(id.toString());
};

export const firstUppercaseIndex = (str: string): number | null => {
	for (var i = 0; i < str.length; i++) {
		if (str[i].match(vietnameseUpperCaseRegex) != null) {
			return i;
		}
	}
	return null;
};

/** Xóa breadcrumbs khỏi đoạn văn
 * bằng cách bắt đầu câu bằng chữ cái viết hoa, nếu không phải viết hoa thì bỏ
 */
export const removeBreadScrumbs = (str: string): string => {
	const index = firstUppercaseIndex(str.normalize('NFC'));
	if (index) {
		return str.slice(index);
	}
	return str;
};

/** Xóa các kí tự không cần thiết khỏi đoạn văn */
export function cleanDescription(str: string): string {
	var description = str.toString().replace(citationRegex, '');
	description = description.replace(datetimeRegex, '');
	// description = description.replace(/( . )/g, '');
	description = description.replace(/(([[:space:]]?)\,([[:space:]]?))/g, ', '); // replace " , " with ", "
	description = description.replace(/(([[:space:]]?)\.([[:space:]]?))/g, '. '); // replace " . " with ". "
	description = description.replace(/(([[:space:]]?)\.\.\.([[:space:]]?))/g, '... '); // replace " ... " with "... "
	description = description.replace(/(([[:space:]]?)\-([[:space:]]?))/g, '- '); // replace " - " with "- "
	return description;
}

/** Chuyển string sang boolean */
export function getBoolean(value: any) {
	switch (value) {
		case true:
		case 'true':
		case 1:
		case '1':
		case 'on':
		case 'yes':
			return true;
		default:
			return false;
	}
}

/** Lấy Token trong header Authorization */
export const getAuthorizationHeaderToken = (req: Request): string => {
	const authHeader = req.headers.authorization;

	if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
		return authHeader.split(' ')[1];
	}
	return '';
};

export const verifyAccessToken = (accessToken: string): Promise<IUser> => {
	return new Promise((resolve, reject) => {
		jwt.verify(
			accessToken,
			config.jwtKey,
			{
				algorithms: ['HS512', 'HS256'],
			},
			async (error, user) => {
				if (error) {
					if (error.name === TokenExpiredError.name) {
						reject('expired');
					}
					reject('error');
				}
				if (!user) {
					return reject('notfound');
				}
				const userFound = await User.findOne({ _id: user._id }).exec();
				resolve(userFound as IUser);
			},
		);
	});
};

export const dateTimezone = moment.tz(Date.now(), 'Asia/Bangkok');

export const BASEDIR = path.resolve(__dirname + '/../');
