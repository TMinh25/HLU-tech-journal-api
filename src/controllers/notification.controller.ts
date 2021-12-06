import { NextFunction, Request, Response } from 'express';
import { AndroidConfig, ApnsConfig, Message } from 'firebase-admin/lib/messaging/messaging-api';
import { messaging } from '../app';

// Set Android priority to "high"
const androidConfig: AndroidConfig = {
	priority: 'high'
};

const apnsConfig: ApnsConfig = {
	payload: {
		aps: {
			contentAvailable: true
		}
	},
	headers: {
		'apns-push-type': 'background',
		'apns-priority': '5', // Must be `5` when `contentAvailable` is set to true.
		'apns-topic': 'io.flutter.plugins.firebase.messaging' // bundle identifier
	}
};

const sendNotificationToken = async (req: Request, res: Response, next: NextFunction) => {
	const { data, notification } = req.body;
	const token = req.params.token;

	var message: Message = {
		token,
		data: data,
		notification: { ...notification },
		android: androidConfig,
		apns: apnsConfig
	};

	// Send a message to the device corresponding to the provided registration token.
	messaging
		.send(message)
		.then((response: any) => {
			// Response is a message ID string.
			res.json({ success: true });
			console.log('Successfully sent message:', response);
		})
		.catch((error: any) => {
			res.json({ success: false, error });
			console.log('Error sending message:', error);
		});
};

const sendNotificationTopic = async (req: Request, res: Response, next: NextFunction) => {
	const { data, notification } = req.body;
	const topic = req.params.topic;

	var message: Message = {
		topic,
		data: data,
		notification: { ...notification },
		android: androidConfig,
		apns: apnsConfig
	};

	// Send a message to the device corresponding to the provided subscription topic.
	messaging
		.send(message)
		.then((response: any) => {
			// Response is a message ID string.
			res.json({ success: true });
			console.log('Successfully sent message:', response);
		})
		.catch((error: any) => {
			res.json({ success: false, error });
			console.log('Error sending message:', error);
		});
};

export default { sendNotificationToken, sendNotificationTopic };
