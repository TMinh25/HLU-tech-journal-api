import { Document, ObjectId } from 'mongoose';

export default interface IJournal extends Document {
	name: string;
	journalGroup: {
		_id: ObjectId;
		name: string;
	};
	tags: string[];
	description: string;
	editors: { _id: ObjectId; name: string; photoURL?: string }[];
	status: boolean;
	initializedAt: Date;
	contributors: { _id: ObjectId; name: string; contributes: string }[];
	createdBy: ObjectId;
	articles: ObjectId[];
	publishedAt?: Date;
}
