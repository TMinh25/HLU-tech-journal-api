import { Document } from 'mongoose';

export default interface IMongoFile extends Document {
	title: string;
	collectionId: string;
	description: string;
	downloadUri: string;
	fileType: string;
}
