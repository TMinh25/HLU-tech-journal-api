import mongoose, { Schema } from 'mongoose';
import IStudent from '../interfaces/student';

const StudentSchema: Schema = new Schema(
	{
		studentID: { type: String, required: true, trim: true },
		name: { type: String, require: true, trim: true },
		DOB: { type: Date, require: false },
		password: { type: String, require: true, trim: true },
		photoURL: { type: String, require: true },
		extraInformation: { type: Object, require: false }
	},
	{
		autoIndex: false,
		timestamps: true,
		_id: true
	}
);

StudentSchema.index({ studentID: 1, _id: 1 }, { unique: true, dropDups: true });

export default mongoose.model<IStudent>('Student', StudentSchema);
