import { Document, ObjectId } from 'mongoose';
import { ArticleStatus, AttendedRole, ReviewResult, ReviewStatus } from '../types';
import IMongoFile from './file';

export default interface IArticle extends Document {
	title: string;
	journal?: {
		_id: ObjectId;
		name: string;
	};
	journalGroup: {
		_id: ObjectId;
		name: string;
	};
	abstract?: string;
	authors: {
		main: { _id: ObjectId; displayName: string; email: string; workPlace: string; backgroundInfomation: string; photoURL: string };
		sub?: { displayName: string; email: string; workPlace?: string; backgroundInfomation?: string }[];
	};
	tags?: string[];
	language: string;
	/**
	 * submission: Nộp bản thảo
	 * review: Tìm phản biện và đánh giá bản thảo
	 * publishing: Hoàn thiện bản thảo và đang xuất bản
	 * completed: Xuất bản
	 */
	status: ArticleStatus;
	visible: boolean;
	detail: {
		reject: {
			reason: string;
			notes?: string;
		};
		submission?: {
			file: IMongoFile;
			messageToEditor?: string;
			orcid?: string;
			website?: string;
			helperFiles?: IMongoFile[];
		};
		review: [
			// rounds
			{
				/**
				 * - request: Đã gửi lời mời phản biện
				 * - requestDecline: Từ chối phản biện
				 * - reviewing: Đang đánh giá bản thảo
				 * - reviewSubmitted: Đã gửi đánh giá bản thảo
				 * - completed: Hoàn tất đánh giá: Ban biên tập có thể gửi phản biện tiếp
				 * hoặc yêu cầu tác giả hoàn thiện bản thảo để đưa vào xuất bản số
				 */
				_id?: ObjectId;
				status: ReviewStatus;
				importantDates: {
					createdAt: Date;
					responseDueDate: Date;
					reviewDueDate: Date;
				};
				reviewer?: ObjectId;
				editor: ObjectId;
				displayFile?: IMongoFile;
				files?: IMongoFile[];
				result?: {
					commentForEditors?: string;
					commentForEveryone?: string;
					files: IMongoFile[];
					recommendations: ReviewResult;
					otherRecommendation: string;
					submittedAt: Date;
				};
				guideLines?: string;
				reject?: {
					reason: string;
					notes?: string;
				};
			},
		];
		publishing: {
			draftFile?: IMongoFile[];
			request: {
				_id?: string;
				text: string;
				files: IMongoFile[];
				responseFile: IMongoFile | undefined;
			}[];
		};
		copyediting: {
			draftFiles: [IMongoFile];
			copyEditedFile?: IMongoFile;
		};
	};
	files: IMongoFile[];
	reviewer?: ObjectId[];
	publishedFile?: IMongoFile;
	publishedAt?: Date;
	contributors?: Contributor[];
	discussions?: Discussion[];
	currentFile?: IMongoFile;
}

export interface Discussion {
	from: ObjectId;
	to: ObjectId;
	message?: string;
	files?: ObjectId[];
	at?: Date;
	seen?: boolean;
}

export interface Contributor {
	_id: ObjectId;
	role: AttendedRole;
}
