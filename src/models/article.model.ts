import moment from 'moment';
import mongoose, { Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import IArticle from '../interfaces/article';
import { ArticleStatus, AttendedRole, ReviewResult, ReviewStatus } from '../types';

const IFile = {
	_id: String,
	title: String,
	downloadUri: String,
	fileType: String,
};

const ArticleSchema: Schema = new Schema(
	{
		title: { type: String, required: true, trim: true, unique: true, uppercase: true },
		journal: { type: { _id: { type: Schema.Types.ObjectId, required: true }, name: { type: String, required: true } }, required: false },
		journalGroup: { _id: { type: Schema.Types.ObjectId, required: true }, name: { type: String, required: true } },
		abstract: { type: String, required: false, unique: true },
		tags: [String],
		authors: {
			main: { _id: Schema.Types.ObjectId, displayName: String, email: String, workPlace: String, backgroundInfomation: String, photoURL: String },
			sub: [{ displayName: String, email: String, workPlace: String, backgroundInfomation: String }],
		},
		language: { type: String, required: true },
		/**
		 * submission: Nộp bản thảo
		 * review: Tìm phản biện và đánh giá bản thảo
		 * publishing: Hoàn thiện bản thảo và đang xuất bản
		 * published: Xuất bản
		 */
		status: { type: String, enum: ArticleStatus, required: true, default: ArticleStatus.submission },
		visible: { type: Boolean, default: true, required: true },
		detail: {
			reject: {
				reason: { type: String, trim: true, default: '' },
				notes: { type: String, trim: true },
			},
			submission: {
				file: { type: IFile, ref: 'files' },
				messageToEditor: { type: String, trim: true },
				orcid: { type: String },
				website: { type: String, trim: true },
				helperFiles: [IFile],
			},
			review: {
				type: [
					{
						/**
						 * - request: Đã gửi lời mời phản biện
						 * - requestDecline: Từ chối phản biện
						 * - reviewing: Đang đánh giá bản thảo
						 * - reviewSubmitted: Đã gửi đánh giá bản thảo
						 * - completed: Hoàn tất đánh giá: Ban biên tập có thể gửi phản biện tiếp
						 * hoặc yêu cầu tác giả hoàn thiện bản thảo để đưa vào xuất bản số
						 */
						status: { type: String, enum: ReviewStatus, required: true, default: ReviewStatus.unassign },
						importantDates: {
							createdAt: { type: Date, required: true, default: moment().format() },
							responseDueDate: { type: Date, required: true, default: moment().add(3, 'days').format() },
							reviewDueDate: { type: Date, required: true, default: moment().add(6, 'days').format() },
						},
						reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
						editor: { type: Schema.Types.ObjectId, ref: 'User' },
						displayFile: IFile,
						files: [IFile, { required: false }],
						result: {
							commentForEditors: { type: String, required: false },
							commentForEveryone: { type: String, required: false },
							files: [IFile],
							recommendations: { type: ReviewResult },
							otherRecommendation: { type: String, required: false },
							submittedAt: { type: Date, default: new Date() },
						},
						guideLines: { type: String, required: false },
						revisions: [
							{
								requestMessage: String,
								requestFiles: [IFile],
								files: [IFile],
								requestAt: { type: Date, default: new Date() },
							},
						],
						reject: {
							type: {
								reason: { type: String, default: '' },
								notes: { type: String, default: '' },
							},
							required: false,
						},
					},
				],
				index: true,
				timestamps: true,
			},
			publishing: {
				draftFile: [IFile],
				request: [
					{
						text: { type: String, required: false },
						files: [IFile],
						responseFile: { type: IFile, required: false },
					},
				],
			},
			copyediting: {
				copyeditor: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null, trim: true },
				notes: { type: String, required: false, default: '' },
				draftFiles: { type: IFile, required: false },
				copyEditedFile: { type: IFile, required: false, default: null },
			},
		},
		files: [IFile],
		reviewer: [Schema.Types.ObjectId],
		publishedAt: { type: Date },
		publishedFile: IFile,
		contributors: [
			{
				_id: { type: Schema.Types.ObjectId, ref: 'User' },
				title: { type: String },
				role: { type: String, enum: AttendedRole },
				status: { type: ArticleStatus },
			},
		],
		discussions: [
			{
				from: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
				to: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
				message: { type: String },
				files: [IFile],
				at: { type: Date, default: new Date() },
				seen: { type: Boolean, default: false },
			},
		],
		currentFile: { type: IFile, required: false, ref: 'Files' },
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

// ArticleSchema.methods.getAllFiles = function (): string[] {
// 	const thisArticle = this.toObject();
// 	const { detail } = <IArticle>thisArticle;

// 	const allFiles = [detail.submission!.file];
// 	if (detail.submission?.helperFiles) {
// 		allFiles.push(...detail.submission.helperFiles);
// 	}
// 	if (detail.review.length && ) {
// 		const allFilesInReview = Array.from<IMongoFile>(detail.review.map(r => r.files).filter(f => f.filter(i=> Boolean(i))).flat())
// 		allFiles.push(...allFilesInReview);
// 	}
// 	return [];
// };

ArticleSchema.index({ 'detail.review': 1 });

// add unique plugin for mongoose
ArticleSchema.plugin(mongooseUniqueValidator);

const Article = mongoose.model<IArticle>('Articles', ArticleSchema);
export default Article;
