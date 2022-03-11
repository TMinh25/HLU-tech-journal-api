import mongoose, { Schema } from 'mongoose';
import INotificationGroup from '../interfaces/notification';
import { Role } from '../types';

const INoti = {
	target: [String],
	title: String,
	description: String,
	link: String,
};

const NotificationGroupSchema: Schema = new Schema(
	{
		noti: [INoti],
		// target: { type: Object, required: true },
		visible: { type: Boolean, required: true, default: true },
	},
	{
		_id: true,
		timestamps: true,
		toObject: {
			minimize: false,
			getters: true,
		},
		versionKey: false,
	},
);

const NotificationGroup = mongoose.model<INotificationGroup>('Notifications', NotificationGroupSchema);
export default NotificationGroup;
