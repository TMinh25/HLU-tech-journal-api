import http from 'http';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import logging from './config/logging';
import config from './config/config';
import mongoose from 'mongoose';
import studentRoutes from './routes/student';
import teacherRoutes from './routes/teacher';

const NAMESPACE = 'Server';
const app = express();

// Connect to MongoDB
mongoose
	.connect(config.mongo.url, config.mongo.options)
	.then(async (res) => logging.info(NAMESPACE, 'Connected to MongoDB'))
	.catch((e) => {
		logging.error(NAMESPACE, e.message, e);
		process.exit(1);
	});

// if (process.env.NODE_ENV === 'development') {
// 	app.use(morgan('dev'));
// }

// Logging the request
app.use((req, res, next) => {
	logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);

	res.on('finish', () => {
		logging.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
	});

	next();
});

// Parse the request
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// Routes
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/', (req, res) => {
	res.status(200).json({
		count: 1
	});
});

// Rules of API
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

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
		message: error.message
	});
});

// Create the server
const httpServer = http.createServer(app);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server running on ${config.server.hostname}: ${config.server.port}`));
