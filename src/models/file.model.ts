import IMongoFile from '../interfaces/file';
import mongoose, { Schema } from 'mongoose';

const FileSchema: Schema = new Schema(
	{
		title: { type: String, required: true, trim: true, default: null },
		downloadUri: { type: String, required: true, default: null },
		fileType: { type: String, default: null },
		createdAt: { type: Date },
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

const MongoFile = mongoose.model<IMongoFile>('File', FileSchema);
export default MongoFile;
