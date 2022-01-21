import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import config from '../config/config';
import logger from '../config/logger';
import { getAuthorizationHeaderToken, isValidObjectID } from '../utils';

const NAMESPACE = 'User Controller';

/**	Model `RefreshToken` dùng để thêm refreshToken vào cơ sở dữ liệu
 */
const RefreshToken = mongoose.model(
	'Refresh Token',
	new Schema(
		{
			token: { type: String, require: true, trim: true },
		},
		{
			versionKey: false,
		},
	),
);

/** `[GET]/user/`
 * @returns
 * Trả về tất cả người dùng có trong cơ sở dữ liệu nếu không có người dùng nào trả về [null]
 *
 * [200]: Có người dùng trong cơ sở dữ liệu và trả về tất cả người dùng
 *
 * [404]: Người dùng không tồn tại trong cơ sở dữ liệu
 *
 * [500]: Lỗi mạng hoặc lỗi server
 */
const getAllUsers = (req: Request, res: Response, next: NextFunction) => {
	User.find({}, '_id displayName aliases sex degree workPlace nation backgroundInfomation email photoURL')
		.exec()
		.then((userRes) => {
			if (userRes.length > 0) {
				res.status(200).json({ success: true, data: userRes, length: userRes.length });
			} else {
				res.status(404).json({ success: false, data: null, error: { title: 'Không có người dùng nào trong cơ sở dữ liệu' } });
			}
		})
		.catch((error) =>
			res.status(500).json({
				success: false,
				error: {
					title: error.message,
					error,
				},
			}),
		);
};

/** `[GET]/user/:_id`
 * @param req.params
 * Chứa id của người dùng cần lấy
 * @returns
 *
 * Trả về người dùng có _id giống với _id truyền vào
 *
 * Kiểm tra _id có hợp lên hay không rồi mới tìm
 *
 * [200]: Người dùng tồn tại và trả về thông tin người dùng
 *
 * [400]: _id truyền vào không hợp lệ
 *
 * [500]: Lỗi mạng hoặc lỗi server
 */
const getUser = (req: Request, res: Response, next: NextFunction) => {
	if (!isValidObjectID(req.params._id)) {
		return res.status(400).json({ success: false, title: 'ID người dùng không đúng' });
	}
	User.findOne({ _id: req.params._id }, '_id displayName aliases sex degree workPlace nation backgroundInfomation email photoURL')
		.exec()
		.then((userRes) => {
			if (userRes === null) {
				res.status(404).json({ success: false, error: { title: 'Không tìm thấy người dùng' } });
			} else {
				res.status(200).json({ success: true, data: userRes });
			}
		})
		.catch((error) => res.status(500).json({ success: false, error: { title: error.message, error: error } }));
};

/** `[GET]/user/attended/:_id`
 * @param req.params
 * Chứa id của người dùng cần xem điểm
 * @returns
 * Trả về điểm số của người dùng có _id giống với _id truyền vào
 *
 * Kiểm tra _id có hợp lên hay không rồi mới tìm
 *
 * [200]: Người dùng tồn tại và trả về điểm của người dùng
 *
 * [400]: _id truyền vào không hợp lệ
 *
 * [404]: Không tìm thấy người dùng
 *
 * [500]: Lỗi mạng hoặc lỗi server
 */
const getUserAttendedArticle = (req: Request, res: Response, next: NextFunction) => {
	if (!isValidObjectID(req.params._id)) {
		return res.status(400).json({ success: false, error: { title: 'ID không khả dụng' } });
	}
	User.findOne({ _id: req.params._id }, 'attendedArticle')
		.exec()
		.then((attendedArticle) => {
			if (attendedArticle === null) {
				res.status(404).json({ success: false, error: { title: 'Không tìm thấy người dùng' } });
			} else {
				res.status(200).json({ success: true, data: attendedArticle });
			}
		})
		.catch((error) => res.status(500).json({ success: false, error: { title: error.message, error: error } }));
};

/** `[POST]/user/find`
 * @param req.body
 * Chứa giá trị: aliases, email, username, workPlace
 * @returns Trả về những người dùng có 3 giá trị chứa 3 giá trị bên trên
 *
 * [200]: Danh sách người dùng
 *
 * [404]: Không có người dùng nào được tìm thấy
 *
 * [500]: Lỗi mạng hoặc server
 */
const findUsers = (req: Request, res: Response, next: NextFunction) => {
	const { aliases, email, displayName, workPlace } = req.body;
	// logger.debug(NAMESPACE, 'findUsers', req.body);
	User.find(
		{ $or: [{ aliases: RegExp(aliases, 'i') }, { email: email }, { displayName: displayName }, { workPlace: RegExp(workPlace, 'i') }] },
		'_id displayName aliases sex degree workPlace nation backgroundInfomation email photoURL',
	)
		.then((result) => {
			if (result.length === 0) {
				return res.status(404).json({ data: null, message: 'No user found', length: 0 });
			}
			return res.status(200).json({ data: result, length: result.length });
		})
		.catch((error) => {
			logger.error(NAMESPACE, error.message, error);
			return res.status(500);
		});
};

/**	`[DELETE]/user/:_id`
 * @deprecated *remove due to unnessesary*
 * @param req.params
 * Chứa ID của người dùng cần xóa
 * @returns
 * [200]: Xóa người dùng thành công
 *
 * [400]: ID truyền vào không hợp lệ
 *
 * [404]: Người dùng không tồn tại
 *
 * [500]: Lỗi mạng hoặc server
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
	// const id = req.params._id;
	// const userExists = await User.exists({ _id: id });

	// if (!isValidObjectID(id)) {
	// 	return res.status(400).json({ success: false, message: 'Invalid id' });
	// } else if (!userExists) {
	// 	return res.status(404).json({ success: false, message: 'User does not exists in database' });
	// } else {
	// 	User.deleteOne({ _id: id })
	// 		.then((result) => {
	// 			if (result.deletedCount == 1) {
	// 				res.status(200).json({ success: true });
	// 			} else {
	// 				res.status(500).json({ success: false, message: 'Unable to remove user' });
	// 			}
	// 		})
	// 		.catch((error) => res.status(500).json({ success: false, message: error.message, error }));
	// }

	return res.status(423).json({ message: 'this route is currently locked' });
};

/** `[GET]/auth/access-token`
 * @param req.body:
 * Chứa refreshToken để tạo accessToken mới để đăng nhập
 * @returns
 * [200]: accessToken và refreshToken mới
 *
 * [403]: bị cấm do refreshToken truyền vào không hợp lệ, hoặc lỗi xác thực token
 *
 * [500]: Lỗi mạng hoặc server
 */
const getAccessToken = (req: Request, res: Response, next: NextFunction) => {
	const oldRefreshToken = req.body.refreshToken;
	RefreshToken.exists({ token: oldRefreshToken })
		.then(async (isTokenExists) => {
			if (!isTokenExists) {
				res.status(403).json({ success: false, error: { title: 'Token không hợp lệ' } });
			} else {
				var decoded = jwt.verify(oldRefreshToken, config.jwtKey, {
					algorithms: ['HS512', 'HS256'],
				});
				// Tìm user với _id đã giải mã
				const user = await User.findOne({ _id: (<any>decoded).data._id }).exec();
				const accessToken = user?.generateAccessToken();
				const userInfomation = user?.userInfomation();
				const newRefreshToken = jwt.sign({ data: userInfomation }, config.jwtKey);
				// Cập nhật refreshToken trong cơ sở dữ liệu
				await RefreshToken.updateOne({ token: oldRefreshToken }, { token: newRefreshToken });
				return res.status(200).json({ success: true, accessToken, refreshToken: newRefreshToken });
			}
		})
		.catch((error) => res.status(500).json(error));
};

/** `[GET]/auth/info`
 * @param req.headers
 * [Authorization]: Bearer *accessToken
 * @returns
 *
 * [200]: Trả về thông tin cá nhân của người dùng
 *
 * [403]: Lỗi giải mã accessToken
 *
 * [400]: Token truyền vào lỗi hoặc không có headers Authorization
 */
const authInfo = async (req: Request, res: Response, next: NextFunction) => {
	const accessToken = getAuthorizationHeaderToken(req);
	jwt.verify(
		accessToken,
		config.jwtKey,
		{
			algorithms: ['HS512', 'HS256'],
		},
		(error, user) => {
			if (error) {
				if (error.name === TokenExpiredError.name) {
					logger.error(NAMESPACE, 'jwt expired');
					return res.status(401).json({ success: false, error: { title: 'Phiên hết hạn', description: 'Hãy đăng nhập lại' } });
				}
				logger.error(NAMESPACE, error.name, error);
				return res.status(401).json({ success: false, error: { title: 'Phiên lỗi', description: 'Hãy đăng nhập lại' } });
			}
			return res.status(200).json({ success: true, data: user });
		},
	);
};

/** `[GET]/auth/signup`
 * Tạo người dùng mới trong cơ sở dữ liệu
 *
 * Phải mã hóa mật khẩu của người dùng với salt = 10
 * @param req.body
 * Chứa thông tin người dùng truyền vào body của đường dẫn
 * @returns
 * [201]: Thành công tạo người dùng
 *
 * [409]: Người dùng có thông tin trùng lặp trong CSDL
 *
 * 				không cho phép 2 người dùng có 1 studentID
 *
 * 				không cho phép 2 người dùng có cùng 1 email
 *
 * 				nếu tài khoản là sinh viên thì phải có classID => phải thuộc về một lớp
 *
 * [500]: Lỗi mạng hoặc server
 */
const signUp = async (req: Request, res: Response, next: NextFunction) => {
	const { displayName, degree, workPlace, nation, email, username, password } = req.body;

	const emptyValidatorObject = <Object>{ ...{ displayName, degree, workPlace, nation, email, username, password } };
	const emptyFieldArray = [];
	for (const [key, value] of Object.entries(emptyValidatorObject)) {
		if (!value) {
			emptyFieldArray.push(key);
		}
	}
	if (emptyFieldArray.length > 0)
		return res.status(400).json({
			success: false,
			error: {
				title: 'Hãy điền đầy đủ thông tin',
			},
			emptyField: emptyFieldArray,
		});

	req.body.password = bcrypt.hashSync(req.body.password, 10);
	const userInfo = req.body;
	const user = new User(userInfo);
	return user
		.save()
		.then((result) => {
			return res.status(201).json({ success: true, data: result });
		})
		.catch((error) => {
			logger.error(NAMESPACE, error);
			if (error.name === 'ValidationError') {
				return res.status(500).json({
					success: false,
					error: { title: 'Thông tin trùng lặp tồn tại trong cơ sở dữ liệu', ...error },
				});
			}
			return res.status(500).json({
				success: false,
				message: error.message,
				error,
			});
		});
};

/** `[POST]/auth/signin`
 * Nếu đăng nhập thành công => tạo accessToken để lấy thông tin người dùng
 * refreshToken để đăng nhập lại lần sau
 * cập nhật refreshToken vào trong cơ sở dữ liệu
 * @param req.body
 * Chứa object thông tin đăng nhập { username, password }
 * @returns
 * [200]: Đăng nhập thành công
 * 				Trả về trạng thái đăng nhập, accessToken, refreshToken
 *
 * [401]: Mật khẩu của tài khoản sai || Tài khoản bị khóa
 *
 * [404]: Tài khoản không tồn tại trong CSDL
 *
 * [500]: Lỗi mạng hoặc server
 */
const signIn = async (req: Request, res: Response, next: NextFunction) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ authenticated: false, error: { title: 'Hãy nhập đầy đủ thông tin' } });
	}
	try {
		const user = await User.findOne({ username: username }).collation({ locale: 'tr', strength: 2 }).exec();
		if (!user) {
			return res.status(404).json({ authenticated: false, error: { title: 'Tài khoản không tồn tại!', description: 'Hãy đăng nhập bằng tài khoản khác' } });
		}
		if (!bcrypt.compareSync(password, user.password)) {
			return res.status(401).json({ authenticated: false, error: { title: 'Mật khẩu của tài khoản không đúng', description: 'Hãy nhập mật khẩu đúng' } });
		}
		if (user.disabled) {
			return res.status(401).json({ authenticated: false, error: { title: 'Tài khoản này hiện tại đang bị khóa' } });
		}
		const accessToken = user?.generateAccessToken();
		// get refreshToken with userInfomation
		const userInfomation = user?.userInfomation();
		const refreshToken = jwt.sign({ data: userInfomation }, config.jwtKey);
		// update refreshToken inside database
		await RefreshToken.findOneAndUpdate({ _id: user._id }, { token: refreshToken }, { new: true, upsert: true });
		res.status(200).json({ authenticated: true, accessToken, refreshToken });
	} catch (error) {
		res.status(500).json({ authenticated: false, error });
	}
};

/** `[DELETE]/auth/logout`
 * @param req.body
 * chứa refreshToken của tài khoản cần đăng xuất
 * @returns
 *
 * [200]: Đăng xuất thành công, xóa refreshToken khỏi CSDL
 *
 * [403]: Không có refreshToken được lưu trong CSDL, bị cấm
 *
 * [400]: Không thể đăng xuất hoặc xóa refreshToken khỏi CSDL
 */
const signOut = (req: Request, res: Response, next: NextFunction) => {
	// FIXME: sửa tình trạng double click trong flutter server đẩy lỗi:
	//  CastError: Cast to ObjectId failed for value "signout" (type string) at path "_id" for model "User"
	const refreshToken = req.body.refreshToken;
	RefreshToken.countDocuments({ token: refreshToken }, (error, count) => {
		if (count > 0) {
			RefreshToken.deleteMany({ token: refreshToken }, (ok) => {
				if (!ok) {
					return res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
				} else {
					return res.status(400).json({ success: false, error: { title: 'Không thể đăng xuất' } });
				}
			});
		} else {
			next();
			return res.status(403);
		}
	});
};

export default { getAllUsers, getUser, getUserScore: getUserAttendedArticle, findUsers, signIn, getAccessToken, signOut, authInfo, signUp, deleteUser };
