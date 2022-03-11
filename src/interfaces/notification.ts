import { ObjectId } from 'mongoose';
import { Role } from '../types';

export interface INotification {
	target?: ObjectId[];
	role?: Role;
	title: string;
	description?: string;
	link?: string;
}

export default interface INotificationGroup {
	noti: INotification[];
	// target: object[];
	visible?: boolean;
}
