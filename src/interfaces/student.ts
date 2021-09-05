import { Document } from 'mongoose';

export default interface IStudent extends Document {
	studentID: string;
	name: string;
	DOB: Date;
	password: string;
	photoURL: string;
	extraInformation: object;
}
