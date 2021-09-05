import { Document } from 'mongoose';

export default interface ITeacher extends Document {
	name: string;
	DOB: Date;
	email: string;
	password: string;
	photoURL: string;
	extraInformation: object;
}
