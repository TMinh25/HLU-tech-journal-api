import dotenv from 'dotenv';

dotenv.config();

const MONGO_OPTIONS: object = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	socketTimeoutMS: 20000,
	keepAlive: true,
	poolSize: 50,
	autoIndex: false,
	retryWrites: false,
};

const MONGO_USERNAME: string = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD: string = process.env.MONGO_PASSWORD || '';
const MONGO_HOST: string = process.env.MONGO_HOST || 'hlu-api.sxwwy.mongodb.net/test-api?retryWrites=true&w=majority';

const MONGO = {
	host: MONGO_HOST,
	username: MONGO_USERNAME,
	password: MONGO_PASSWORD,
	options: MONGO_OPTIONS,
	url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`,
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.PORT || 3000;

const SERVER = {
	hostname: SERVER_HOSTNAME,
	port: SERVER_PORT,
};

const JWT_KEY = process.env.JWT_KEY || 'this.is.my.secret';

const STREAM_CHAT = {
	apiKey: process.env.STREAM_CHAT_API_KEY || 'wfkg5ysm9qcp',
	apiSecret: process.env.STREAM_CHAT_API_SECRET || 'NguyenTruongMinh735568',
};

const SERVICE_ACCOUNT = {
	type: 'service_account',
	project_id: 'chatty-f361f',
	private_key_id: '825ba6cf52ef2c28160e3be1d49cac75b4ff7f78',
	private_key:
		'-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDJ+2RQ2ocynJfG\nenDGyVJchtEINGHrJn9vpdLu6VpJUQbNhoDYgiB7N/5PHXP6XjFbfV+fGemCJHVj\nK6m0F/Z2VemmHGtMrLOum84x9ntRgSfS6gZ6lams4Bk+H3lrCeJIYcI8Ppdg0Sjn\n+6OOkW8WjaD2RcgFvICl5vMze257+EzVPhGTuVrNBNosG1I7/6yz5nVs7UIjrHqi\nqoUw+FnFWZ3HjTwINxYQJRp+/unfS35oosReTw59IB0N5aeMBURNcnXBoAQj/IW0\n8kqcsupRmQ6SKSh6ZJBNxTU2kuNE4X1WX5MhShTAy8KIsC7D801TpLHcZmJmcyhN\nF1IooAuvAgMBAAECggEABEAA7V6bx6nZ27hJ1TT5Qa8oiNapVMxblBrWJGbOmopU\n7VAuN+ANFOqptDp3bUY8HaO2tl9SNYXU3oBVss9qRTUrlG42p8dehIcMwKpiD+X6\n04pPFpc9mcChZ1g8Ms9jboh4ENJ0VvovtSnrWB2hS8UxJN11BwHfZx5D8cpgGcWn\nJAp2Q7dMRcE6PyboB1EpbFl+bXuFTPgCznQhwYB8yA4QjbuH5Ukiwu8a/7yNxtIJ\nv4xOmtlSC0JfRwE8WSM9BEdXqVl6yIrTn2dq6nmOJeQMbJSjIlQTBwbgrS6ISd9K\n4YZ47CAq9WcvwhmnCqcQYvWp5I6xPreLSF59bLkHwQKBgQD5ULgJhaetJrscE8N6\n0XN7nlrbcOQiTaLtHb/KjjWndn+H6Mf5Li39LuiQSXyw74sE11E+SdniKgZTs7B3\n6ByOqgetDScDrWkky7lBuh/gsZaM7W/08pGOJf1udGw2ZSd6nvEXlBSumharhSRQ\nsrKLJe36ePJbF2Lt2HeizM2AYQKBgQDPZcfgqnXtUJ1H9NttjxVt4TWw0qWpHsBE\nGr3DzNsmDDwtTHgaanWA04YRA6dw7k0V9HDeapv9/f/h+QWYpOn6+O5qRT8+F5l5\nX3gX8ScQaTV/2xrm3exgEkN4CQcHZFpD6R4zyGlc8uLp2YPbyHY3UGtfifVFm8XJ\nOu5vdVtGDwKBgQCYIihbLyK1ZxfwNyMms96rRWMd2tJrGELePDQHbyXQbV++2E4G\ngKZxg4lIWn9rHJERQC6EOt5owsofk1uQn6Olbp3GfGsdNFkfqez+7Yt8OgGrN0wF\nBWvKeOYf240Y2Drx+UEW6TaBoOdKfLE/SPvoKxn/qIQDD88/YcMHJcAUoQKBgQCH\n4Y11OvmMhHanwFtLiqVlmloNAdYb2dPqSwLtl/g1E2sR2roNxJY701pRJ2265caH\njeGtN3gAjzvpF7h86/+IuTOrWLc4vUmGZfBO72bCr8uneyxC+j92KkEeEfwS8cLa\nH4/0KWgux8u3nxVvGAWr8/qFW+PguVB6qSuyxtcILQKBgFtiG8sBl6w9BtcbZHZz\nKL4uhRFFjI1MlAd+vAsF3PzVcWfCcgGx5L28PnztZX8QUP1jm9nFhDviAK96PB5v\nDDjHFGuHHtova2pygw/Ze6Xa7xRO+cVAJM/hdqfA/Yt2BUY1dYSplSnRkHzqnJqc\nZY4tyCmLsPm80vfLq2jJAYG2\n-----END PRIVATE KEY-----\n',
	client_email: 'firebase-adminsdk-znjo1@chatty-f361f.iam.gserviceaccount.com',
	client_id: '110091839378865042890',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-znjo1%40chatty-f361f.iam.gserviceaccount.com',
};

const config = {
	mongo: MONGO,
	server: SERVER,
	jwtKey: JWT_KEY,
	streamChat: STREAM_CHAT,
	serviceAccount: SERVICE_ACCOUNT,
};

export default config;
