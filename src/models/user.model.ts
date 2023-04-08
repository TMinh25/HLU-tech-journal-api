import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import { ArticleStatus, AttendedRole, Role } from '../types';

const UserSchema: Schema = new Schema(
	{
		/** Họ và tên hiển thị của người dùng */
		displayName: { type: String, require: true, trim: true, default: null }, // Tên hiển thị
		/** user token from getstream.io */
		streamToken: { type: String, require: true },
		/** Bí danh */
		aliases: { type: String, require: false, trim: true },
		/** Giới tính
		 * ```js
		 * 0 = "nữ"
		 * 1 = "nam"
		 * null = "không xác định"
		 * ```
		 */
		sex: { type: Number, require: false },
		/** Quyền của người dùng
		 */
		role: { type: Number, enum: Role, require: true, default: Role.users, trim: true, unique: false },
		/** Bằng cấp */
		degree: { type: String, require: true, default: null },
		/** Nơi làm việc */
		workPlace: { type: String, require: true, default: null },
		/** Quốc gia */
		nation: { type: String, require: true, trim: true, default: null },
		/** Thông tin background của người dùng, thông tin thêm */
		backgroundInfomation: { type: String, require: false, trim: true },
		/** Email của người dùng đăng kí */
		email: { type: String, require: true, unique: true, default: null },
		/** Tên đăng nhập của người dùng */
		username: { type: String, require: true, trim: true, unique: true, default: null },
		/** Mật khẩu đã mã hóa */
		password: { type: String, require: true, trim: true, default: null },
		/** Link ảnh đại diện */
		photoURL: { type: String, require: false, default: '' },
		/** Tài khoản người dùng bị khóa */
		disabled: { type: Boolean, require: true, default: false },
		/** Tài khoản người dùng đã được xác thực email hay chưa */
		verified: { type: Boolean, require: true, default: false },
		/** Cài đặt của người dùng */
		userSetting: {
			type: Object,
			require: false,
			default: {
				theme: 'dark',
				language: 'vietnam',
				billingInfo: [],
				forReviewer: {
					acceptingReview: false,
					reviewField: [],
					specialized: [],
					citizenIdentification: undefined,
					phone: undefined,
				},
				forReader: {
					acceptingEmail: true,
					acceptingNotification: true,
				},
			},
		},
		/** Array chứa các bài viết đã tham gia
		 * ```js
		 * example = {
		 * _id: "61610ed484d2094e34913045",
		 * type: "magazine",
		 * name: "Số khoa học công nghệ",
		 * number: 12,
		 * articleId: "61610ed484d2094e34913045",
		 * status: "publishing",
		 * role: 0 }
		 * ```
		 */
		//TODO: find to add Record
	},

	{
		_id: true,
		timestamps: true,
		autoIndex: true,
		toObject: {
			minimize: false,
			getters: true,
		},
		versionKey: false,
	},
);

/**
 * @returns accessToken of the user
 */
UserSchema.methods.generateAccessToken = function (): string {
	const thisUser = this.toObject();
	// TODO: ugly code
	const { _id, displayName, aliases, sex, disabled, verified, role, degree, workPlace, nation, email, photoURL, userSetting } = <IUser>thisUser;
	const accessTokenInfo = { ...{ _id, displayName, aliases, sex, disabled, verified, role, degree, workPlace, nation, email, photoURL, userSetting } };
	const accessToken = jwt.sign(accessTokenInfo, config.jwtKey, { algorithm: 'HS512', expiresIn: '7d' }); // expired in 7 days
	return accessToken;
};

/**
 * @returns refreshToken of the user
 */
UserSchema.methods.generateRefreshToken = function (): string {
	const thisUser = this.toObject();
	// TODO: ugly code
	const { _id, displayName, aliases, sex, disabled, verified, role, degree, workPlace, nation, email, photoURL, userSetting } = <IUser>thisUser;
	const refreshTokenInfo = { ...{ _id, displayName, aliases, sex, disabled, verified, role, degree, workPlace, nation, email, photoURL, userSetting } };
	const refreshToken = jwt.sign({ data: refreshTokenInfo }, config.jwtKey);
	return refreshToken;
};

// add unique plugin for mongoose
UserSchema.plugin(mongooseUniqueValidator);

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
