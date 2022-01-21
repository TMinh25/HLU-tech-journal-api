import IMongoFile from '../interfaces/file';
import mongoose, { Schema } from 'mongoose';
import config from '../config/config';

const FileSchema: Schema = new Schema(
	{
		title: { type: String, required: true, trim: true, default: null },
		description: { type: String, required: false, trim: true, default: null },
		downloadUri: { type: String, required: true, default: null },
		fileType: { type: String, required: true, default: null },
		collectionId: { type: mongoose.Types.ObjectId, required: false, trim: true, default: null },
	},
	{
		_id: true,
		timestamps: true,
		toObject: {
			minimize: false,
			getters: true,
		},
		versionKey: false,
	},
);

export default mongoose.model<IMongoFile>('File', FileSchema);
