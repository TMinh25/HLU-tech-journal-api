import http from 'http';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import passport from 'passport';
import mongoose from 'mongoose';
import logger from './config/logger';
import config from './config/config';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import covidCrawlerRoutes from './routes/covidCrawler.routes';
import plagiarismRoutes from './routes/plagiarismCrawler.routes';
import fileStorageRoutes from './routes/fileStorage.routes';
import journalRoutes from './routes/journal.routes';
import { mongoDbInitValidation } from './middlewares/initValidation';
import { tokenAuthorization } from './middlewares/tokenAuthorization';
import journalGroupRoutes from './routes/journalGroup.routes';
import articleRoutes from './routes/article.routes';
import { StreamChat } from 'stream-chat';
import journalGroupController from './controllers/journalGroup.controller';
import notificationRoutes from './routes/notification.routes';

const NAMESPACE = 'Server';
const app = express();

// Initialization
export default mongoose
	.connect(config.mongo.url, config.mongo.options)
	.then((_) => {
		logger.info(NAMESPACE, 'Connected to MongoDB');
		journalGroupController.createDefaultJournalGroups();
	})
	.catch((error) => {
		logger.error(NAMESPACE, 'Failed to connect to MongoDB', error);
		process.exit(1);
	});

if (config.enviroment === 'development') {
	mongoose.set('debug', false);
}

/** GetStream server instance */
export const getStreamInstance = StreamChat.getInstance(config.streamChat.key, config.streamChat.secret);

// Logging the request
try {
	app.use((req: Request, res: Response, next: NextFunction) => {
		const { method, url } = req;
		logger.request(NAMESPACE, method, url);

		// log when finish request
		res.on('finish', () => {
			logger.response(NAMESPACE, method, url, res.statusCode);
		});
		// log when error appear
		res.on('error', (error) => {
			logger.error(NAMESPACE, `${error.stack}`);
			if (error) return res.status(500).send({ message: 'Server is down!', error });
		});
		next();
	});
} catch (error) {
	logger.error(NAMESPACE, 'logger error');
}

// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
// 	res.header('Access-Control-Allow-Credentials', true);
// 	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH');
// 	next();
// });

// Parse the request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
var corsOptions = {
	allowedHeaders: '*',
	origin: '*',
	optionsSuccessStatus: 200,
	credentials: true,
};
app.use(cors());
app.use(passport.initialize());
app.use(mongoDbInitValidation);

// Routes
app.use('/user', tokenAuthorization, userRoutes);
app.use('/auth', authRoutes);
app.use('/notification', notificationRoutes);
// app.use('/covid', tokenAuthorization, covidCrawlerRoutes);
app.use('/plagiarism', tokenAuthorization, plagiarismRoutes);
app.use('/file', fileStorageRoutes);
app.use('/article', articleRoutes);
app.use('/journal', journalRoutes);
app.use('/journal-group', journalGroupRoutes);

// Rules of API
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	// res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

	if (req.method == 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST PUT');
		return res.status(200).json({});
	}

	next();
});

// Error Handling
app.use((req, res, next) => {
	const error = new Error('not found');

	return res.status(404).json({
		message: error.message,
	});
});

// Create the server
const httpServer = http.createServer(app);
const { port, hostname } = config.server;
httpServer.listen({ port: port, host: '0.0.0.0' }, () => logger.info(NAMESPACE, `Server running on ${hostname}:${port}`));
