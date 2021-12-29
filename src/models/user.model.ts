import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import uniqueValidator from 'mongoose-unique-validator';

const UserSchema: Schema = new Schema(
	{
		/** Họ và tên hiển thị của người dùng */
		displayName: { type: String, require: true, trim: true, default: null }, // Tên hiển thị
		/** Bí danh */
		aliases: { type: String, require: false, trim: true, unique: true },
		/** Giới tính
		 * ```js
		 * 0 = "nữ"
		 * 1 = "nam"
		 * null = "không xác định"
		 * ```
		 */
		sex: { type: Number, require: false },
		/** Quyền của người dùng
		 * ```js
		 * 0 = "ban biên tập"
		 * 1 = "người dùng"
		 * ```
		 */
		role: { type: Number, require: true, default: 1 },
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
		photoURL: { type: String, require: false },
		/** Tài khoản người dùng bị khóa */
		disabled: { type: Boolean, require: true, default: false },
		/** Cài đặt của người dùng */
		userSetting: {
			type: Object,
			require: false,
			default: {
				theme: 'light',
				language: 'vietnam',
				forReviewer: {
					acceptingReview: false,
					reviewField: [],
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
		 * name: "Tạp chí khoa học công nghệ",
		 * number: 12,
		 * articleId: "61610ed484d2094e34913045",
		 * status: "publishing",
		 * role: 0 }
		 * ```
		 */
		attendedArticle: [
			{
				_id: mongoose.Types._ObjectId,
				type: String,
				name: String,
				number: Number,
				articleId: mongoose.Types._ObjectId,
				status: String,
				role: Number,
			},
		],
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
// using anonimous function for context
UserSchema.methods.generateAccessToken = function (): string {
	const thisUser = this.toObject();
	delete (<any>thisUser).password;
	delete (<any>thisUser).createdAt;
	delete (<any>thisUser).updatedAt;
	const accessToken = jwt.sign(thisUser, config.jwtKey, { algorithm: 'HS512', expiresIn: 30 });
	return accessToken;
};

/**
 * @returns user infomation without sensitive info
 */
// using anonimous function for context
UserSchema.methods.userInfomation = function (): object {
	const thisUser = this.toObject();
	delete (<any>thisUser).password;
	delete (<any>thisUser).createdAt;
	delete (<any>thisUser).updatedAt;
	return thisUser;
};

// add unique plugin for mongoose
UserSchema.plugin(uniqueValidator);

export default mongoose.model<IUser>('User', UserSchema);
