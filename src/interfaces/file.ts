import { Document } from 'mongoose';

export default interface IMongoFile extends Document {
	title: string;
	collectionId: string;
	description: string;
	file_path: string;
	file_mimetype: string;
}
