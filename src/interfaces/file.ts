import { Document, ObjectId } from 'mongoose';

export default interface IMongoFile extends Document {
	_id: string;
	title: string;
	downloadUri: string;
	fileType: string;
	createdAt: Date;
}
