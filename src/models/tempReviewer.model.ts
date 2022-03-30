import IMongoFile from '../interfaces/file';
import mongoose, { Schema } from 'mongoose';

const TempReviewerSchema: Schema = new Schema(
	{
		displayName: { type: String, required: true, trim: true, default: null },
		email: { type: String, required: true, default: null },
		tags: { type: [String], required: false, default: [] },
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

const TempReviewer = mongoose.model('TempReviewer', TempReviewerSchema);
export default TempReviewer;
