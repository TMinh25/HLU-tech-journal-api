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
	retryWrites: false
};

const MONGO_USERNAME: string = process.env.MONGO_USERNAME || '';
const MONGO_PASSWORD: string = process.env.MONGO_PASSWORD || '';
const MONGO_HOST: string = process.env.MONGO_HOST || 'hlu-api.sxwwy.mongodb.net/test-api?retryWrites=true&w=majority';

const MONGO = {
	host: MONGO_HOST,
	username: MONGO_USERNAME,
	password: MONGO_PASSWORD,
	options: MONGO_OPTIONS,
	url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 3000;

const SERVER = {
	hostname: SERVER_HOSTNAME,
	port: SERVER_PORT
};

const JWT_KEY = process.env.JWT_KEY || 'this.is.my.secret';

const config = {
	mongo: MONGO,
	server: SERVER,
	jwt_key: JWT_KEY
};

export default config;
