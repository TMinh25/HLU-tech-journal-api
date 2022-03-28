import { Document, ObjectId } from 'mongoose';

export default interface IJournal extends Document {
	name: string;
	journalGroup: {
		_id: ObjectId;
		name: string;
	};
	tags: string[];
	description: string;
	status: boolean;
	initializedAt: Date;
	createdBy: ObjectId;
	articles: ObjectId[];
	publishedAt?: Date;
}
