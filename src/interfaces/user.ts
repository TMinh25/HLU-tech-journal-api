import { Document } from 'mongoose';

export default interface IUser extends Document {
	displayName: string;
	aliases: string;
	sex: number;
	role: number;
	degree: string;
	workPlace: string;
	nation: string;
	backgroundInfomation: string;
	email: string;
	username: string;
	password: string;
	photoURL: string;
	disabled: boolean;
	userSetting: Object;
	attendedArticle: Array<object>;
	createdAt: Date;
	updatedAt: Date;

	generateAccessToken(): string;

	userInfomation(): object;
}
