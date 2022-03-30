import mongoose, { Schema } from 'mongoose';

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
export default RefreshToken;
