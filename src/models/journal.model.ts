import moment from 'moment';
import mongoose, { Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import IJournal from '../interfaces/journal';

/**	Model `Journal`: Một số trong cơ sở dữ liệu */
const JournalSchema: Schema = new Schema(
	{
		/** Tên của số */
		name: { type: String, trim: true, required: true, unique: true },
		/** Chuyên san của số */
		journalGroup: { _id: { type: Schema.Types.ObjectId, required: true }, name: String },
		/** Từ khóa của số */
		tags: [{ type: String, trim: true }],
		/** Mô tả số */
		description: { type: String, trim: true, default: '' },
		/**
		 * Trạng thái của số:
		 * true:  Đã xuất bản
		 * false: Đang xuất bản
		 */
		status: { type: Boolean, required: true, default: false },
		/** Số được tạo bởi ai */
		createdBy: {
			_id: { type: Schema.Types.ObjectId },
			displayName: { type: String },
			at: { type: Date, default: moment().format() },
		},
		/** Các bài báo trong số */
		articles: [Schema.Types.ObjectId],
		/** Thời gian xuất bản */
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
