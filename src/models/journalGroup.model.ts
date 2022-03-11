import mongoose, { Schema } from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';
import IJournalGroup from '../interfaces/journalGroup';

const JournalGroupSchema: Schema = new Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		tags: [{ type: String, required: true, trim: true }],
		createBy: {
			_id: { type: Schema.Types.ObjectId, required: true },
			at: { type: Date, required: true },
		},
	},
	{
		_id: true,
		timestamps: true,
		autoIndex: true,
		toObject: {
			minimize: false,
			getters: true,
		},
		versionKey: false,
	},
);

JournalGroupSchema.plugin(mongooseUniqueValidator);

const JournalGroup = mongoose.model<IJournalGroup>('Journal Group', JournalGroupSchema);
export default JournalGroup;
