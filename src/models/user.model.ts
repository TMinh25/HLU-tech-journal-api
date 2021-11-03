import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/user';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const UserSchema: Schema = new Schema(
	{
		classID: { type: Schema.Types.ObjectId, require: false, trim: true },
		displayName: { type: String, require: true, trim: true },
		DOB: { type: Date, require: false },
		role: { type: Number, require: true, default: 4 },
		studentID: { type: String, require: false },
		email: { type: String, require: false },
		phone: { type: String, require: false },
		username: { type: String, require: true, trim: true },
		password: { type: String, require: true, trim: true },
		photoURL: { type: String, require: false },
		studyScore: { type: Object, require: false, default: {} },
		curricularScore: { type: Object, require: false, default: {} }
	},
	{
		_id: true,
		timestamps: true,
		autoIndex: true,
		toObject: {
			minimize: false,
			getters: true
		},
		versionKey: false
	}
);

UserSchema.methods.generateAccessToken = function (): string {
	const thisUser = this.toObject();
	delete (<any>thisUser).password;
	delete (<any>thisUser).createdAt;
	delete (<any>thisUser).updatedAt;
	const accessToken = jwt.sign(thisUser, config.jwt_key, { algorithm: 'HS512', expiresIn: 604800 });
	return accessToken;
};

UserSchema.methods.userInfomation = function (): object {
	const thisUser = this.toObject();
	delete (<any>thisUser).password;
	delete (<any>thisUser).createdAt;
	delete (<any>thisUser).updatedAt;
	return thisUser;
};

export default mongoose.model<IUser>('User', UserSchema);
