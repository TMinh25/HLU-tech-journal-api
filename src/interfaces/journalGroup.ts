import { Document, ObjectId } from 'mongoose';

export default interface IJournalGroup extends Document {
	name: string;
	tags: string[];
	createBy: {
		_id: ObjectId;
		at: Date;
	};
}
