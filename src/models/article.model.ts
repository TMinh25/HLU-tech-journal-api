import IArticle from '../interfaces/article';
import mongoose, { Schema } from 'mongoose';
import File from '../models/file.model';
import { Discussion } from '../interfaces/article';

const ArticleSchema: Schema = new Schema(
	{
		title: { type: String, required: true, trim: true },
		journalId: { type: Schema.Types.ObjectId, required: true },
		abstract: { type: String, required: false },
		authors: {
			main: Schema.Types.ObjectId,
			sub: [Schema.Types.ObjectId],
		},
		/**
		 * submission: Nộp bản thảo
		 * review: Tìm phản biện và đánh giá bản thảo
		 * publishing: Hoàn thiện bản thảo và đang xuất bản
		 * published: Xuất bản
		 */
		status: { type: String, required: true, default: 'submission' },
		detail: {
			review: [
				{
					/**
					 * - request: Đã gửi lời mời phản biện
					 * - requestDecline: Từ chối phản biện
					 * - reviewing: Đang đánh giá bản thảo
					 * - reviewSubmitted: Đã gửi đánh giá bản thảo
					 * - completed: Hoàn tất đánh giá: Ban biên tập có thể gửi phản biện tiếp
					 * hoặc yêu cầu tác giả hoàn thiện bản thảo để đưa vào xuất bản tạp chí
					 */
					status: { type: String, required: true, default: 'request' },
					importantDates: {
						responseDueDate: { types: Schema.Types.Date },
						reviewDueDate: { types: Schema.Types.Date },
					},
					discussions: [
						{
							from: { type: Schema.Types.ObjectId, required: true },
							to: { type: Schema.Types.ObjectId, required: true },
							message: { type: String, required: true },
							files: [Schema.Types.ObjectId],
						},
					],
					reviewers: [Schema.Types.ObjectId],
					displayFile: { type: Schema.Types.ObjectId },
					files: [Schema.Types.ObjectId],
					result: {
						comment: { type: String, required: false },
						files: [Schema.Types.ObjectId],
						recommendations: { type: String },
					},
				},
			],
			revision: {
				discussions: [
					{
						from: { type: Schema.Types.ObjectId, required: true },
						to: { type: Schema.Types.ObjectId, required: true },
						message: { type: String, required: true },
						files: [Schema.Types.ObjectId],
					},
				],
				files: [Schema.Types.ObjectId],
			},
			publishing: {
				draftFile: { type: Schema.Types.ObjectId, required: true },
				discussions: [
					{
						from: { type: Schema.Types.ObjectId, required: true },
						to: { type: Schema.Types.ObjectId, required: true },
						message: { type: String, required: true },
						files: [Schema.Types.ObjectId],
					},
				],
				publishedFile: Schema.Types.ObjectId,
			},
			files: [Schema.Types.ObjectId],
			reviewer: [Schema.Types.ObjectId],
			publishedFile: Schema.Types.ObjectId,
			contributors: [
				{
					_id: { type: Schema.Types.ObjectId, required: true },
					contributes: { type: String, required: true },
				},
			],
		},
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
