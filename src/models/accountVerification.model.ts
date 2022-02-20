import mongoose, { Schema } from 'mongoose';
import config from '../config/config';
import jwt from 'jsonwebtoken';

interface IAccountVerification extends Document {
	userId: string;
}

const AccountVerificationSchema: Schema = new Schema(
	{
		userId: { type: mongoose.Types.ObjectId, required: true, trim: true, default: null },
	},
	{
		_id: true,
		toObject: {
			minimize: false,
			getters: true,
		},
		versionKey: false,
	},
);

const AccountVerification = mongoose.model<IAccountVerification>('Account Verification', AccountVerificationSchema);
export default AccountVerification;
