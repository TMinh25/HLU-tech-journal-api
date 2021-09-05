import mongoose, { Schema } from 'mongoose';
import ITeacher from '../interfaces/teacher';
import uniqueValidator from 'mongoose-unique-validator';
mongoose.set('debug', true);
const TeacherSchema: Schema = new Schema(
	{
		// _id: {type: mongoose.Types.ObjectId},
		name: {
			type: String,
			required: true,
			trim: true
		},
		DOB: {
			type: Date,
			require: false
		},
		email: {
			type: String,
			required: true,
			match: /.+\@.+\..+/,
			trim: true
		},
		password: {
			type: String,
			required: true,
			trim: true
		},
		photoURL: {
			type: String,
			required: false
		},
		extraInformation: {
			type: Object,
			require: false
		}
	},
	{
		autoIndex: false,
		timestamps: true,
		_id: true
	}
);

TeacherSchema.index({ email: 1, _id: 1 }, { unique: true, dropDups: true });

export default mongoose.model<ITeacher>('Teacher', TeacherSchema);
