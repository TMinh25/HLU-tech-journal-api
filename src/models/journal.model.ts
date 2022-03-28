import mongoose, { Schema, ObjectId } from 'mongoose';
import moment from 'moment';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import IJournal from '../interfaces/journal';

/**	Model `Journal`: số của cơ sở dữ liệu
 */
const JournalSchema: Schema = new Schema(
	{
		name: { type: String, trim: true, required: true, unique: true },
		journalGroup: { _id: { type: Schema.Types.ObjectId, required: true }, name: String },
		tags: [{ type: String, trim: true }],
		description: { type: String, trim: true, default: '' },
		/**
		 * Trạng thái của số:
		 * true:  Đã xuất bản
		 * false: Đang xuất bản
		 */
		status: { type: Boolean, required: true, default: false },
		createdBy: {
			_id: { type: Schema.Types.ObjectId },
			displayName: { type: String },
			at: { type: Date, default: moment().format() },
		},
		articles: [Schema.Types.ObjectId],
		publishedAt: { type: Date },
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

// add unique plugin for mongoose
JournalSchema.plugin(mongooseUniqueValidator);

const Journal = mongoose.model<IJournal>('Journal', JournalSchema);

export default Journal;
