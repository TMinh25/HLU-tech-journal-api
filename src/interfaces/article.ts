import { Document, ObjectId } from 'mongoose';

export default interface IArticle extends Document {
	title: string;
	journalId: ObjectId;
	abstract: string;
	authors: {
		main: ObjectId;
		sub: ObjectId[];
	};
	/**
	 * submission: Nộp bản thảo
	 * review: Tìm phản biện và đánh giá bản thảo
	 * revision: Chỉnh sửa bản thảo qua đánh giá của phản biện
	 * publishing: Hoàn thiện bản thảo và đang xuất bản
	 * completed: Xuất bản
	 */
	status: string;
	detail: {
		review: [
			// rounds
			{
				/**
				 * - request: Đã gửi lời mời phản biện
				 * - requestDecline: Từ chối phản biện
				 * - reviewing: Đang đánh giá bản thảo
				 * - reviewSubmitted: Đã gửi đánh giá bản thảo
				 * - completed: Hoàn tất đánh giá: Ban biên tập có thể gửi phản biện tiếp
				 * hoặc yêu cầu tác giả hoàn thiện bản thảo để đưa vào xuất bản tạp chí
				 */
				status: string;
				importantDates: {
					responseDueDate: Date;
					reviewDueDate: Date;
				};
				discussions: Discussion[];
				reviewers: ObjectId[];
				displayFile: ObjectId;
				files: ObjectId[];
				result: {
					comment: string;
					files: ObjectId[];
					recommendations: string;
				};
			},
		];
		revision: {
			discussions: Discussion[];
			files: ObjectId[];
		};
		publishing: {
			draftFile: ObjectId;
			discussions: Discussion[];
			publishedFile: ObjectId;
		};
	};
	files: ObjectId[];
	reviewer: ObjectId[];
	publishedFile: ObjectId;
	contributors: Contributor[];
	// name: string;
	// tags: string[];
	// description: string;
	// editors: ObjectId[];
	// status: boolean;
	// initializedAt: Date;
	// contributors: ObjectId[];
	// createdBy: ObjectId;
	// articles: ObjectId[];
}

export interface Discussion {
	from: ObjectId;
	to: ObjectId;
	message: string;
	files: ObjectId[];
}

export interface Contributor {
	_id: ObjectId;
	contributes: string;
}
