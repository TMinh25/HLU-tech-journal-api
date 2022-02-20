import mongoose, { Schema } from 'mongoose';

interface IResetPasswordRequest extends Document {
	userId: string;
	token: string;
}

const ResetPasswordRequestSchema: Schema = new Schema(
	{
		userId: { type: mongoose.Types.ObjectId, required: true, trim: true, default: null },
		token: { type: String, required: true, trim: true, default: null },
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
const ResetPasswordRequest = mongoose.model<IResetPasswordRequest>('Password Reset', ResetPasswordRequestSchema);

export default ResetPasswordRequest;
