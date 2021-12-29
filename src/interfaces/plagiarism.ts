import { Document } from 'mongoose';
import { StringLiteralLike } from 'typescript';

export default interface PlagiarismModel {
	similarityPercent: Number | null;
	similarityFound: Number | null;
	plagTitle: String | null;
	plagDescription: String | null;
	plagUrl: String | null;
}
