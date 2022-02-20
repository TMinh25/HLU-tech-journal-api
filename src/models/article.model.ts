import IArticle from '../interfaces/article';
import mongoose, { Schema } from 'mongoose';
import File from '../models/file.model';

const ArticleSchema: Schema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		journalId: { type: mongoose.Types.ObjectId, required: true },
		abstract: { type: String, required: false },
		authors: [mongoose.Types.ObjectId],
		/**
		 * submission: Nộp bản thảo
		 * review: Tìm phản biện và đánh giá bản thảo
		 * publishing: Hoàn thiện bản thảo và đang xuất bản
		 * published: Xuất bản
		 */
		status: { type: String, required: true, default: 'submission' },
		document: [mongoose.Types.ObjectId],
		reviewer: [mongoose.Types.ObjectId],
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

const Article = mongoose.model<IArticle>('Article', ArticleSchema);
export default Article;
