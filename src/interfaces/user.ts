import { Document } from 'mongoose';

export default interface IUser extends Document {
	displayName: string;
	classID: string;
	DOB: Date;
	role: number;
	studentID: string;
	email: string;
	phone: String;
	username: string;
	password: string;
	photoURL: string;
	studyScore: Object;
	curricularScore: Object;
	createdAt: Date;
	updatedAt: Date;

	generateAccessToken(): string;

	userInfomation(): object;
}
