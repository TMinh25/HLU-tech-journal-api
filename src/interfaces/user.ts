import { Document, ObjectId } from 'mongoose';
import { ArticleStatus, AttendedRole, Role } from '../types';

export default interface IUser extends Document {
	displayName: string;
	streamToken: string;
	aliases?: string;
	sex: number;
	role: Role;
	degree: string;
	workPlace: string;
	nation: string;
	backgroundInfomation: string;
	email: string;
	username: string;
	password?: string;
	photoURL: string;
	disabled: boolean;
	verified: boolean;
	userSetting: {
		theme: 'dark';
		language: 'vietnam';
		forReviewer: {
			acceptingReview: false;
			reviewField: string[];
		};
		forReader: {
			acceptingEmail: true;
			acceptingNotification: true;
		};
	};
	createdAt: Date;
	updatedAt: Date;

	generateAccessToken(): string;
	generateRefreshToken(): string;

	// userInfomation(): object;
}
