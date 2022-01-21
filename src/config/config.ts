import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

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

const CLOUDINARY = {
	url: process.env.CLOUDINARY_URL,
	apiSecret: process.env.CLOUDINARY_API_SECRET,
	apiKey: process.env.CLOUDINARY_API_KEY,
	cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'gr4y',
};

const config = {
	mongo: MONGO,
	server: SERVER,
	jwtKey: JWT_KEY,
	streamChat: STREAM_CHAT,
	cloudinary: CLOUDINARY,
	enviroment: process.env.NODE_ENV,
};

export default config;
