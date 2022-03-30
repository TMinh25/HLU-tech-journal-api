import { ObjectId } from 'mongoose';
import { Role } from '../types';

export default interface INotification {
	title: string;
	content?: string;
	link?: string;
}
