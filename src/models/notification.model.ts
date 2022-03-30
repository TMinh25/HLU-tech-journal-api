import mongoose, { Schema } from 'mongoose';
import INotification from '../interfaces/notification';

const NotificationGroupSchema: Schema = new Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: false, default: '' },
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

const Notification = mongoose.model<INotification>('Notifications', NotificationGroupSchema);
export default Notification;
