import express from 'express';
import controller from '../controllers/notification.controller';

const notificationRoutes = express.Router();

notificationRoutes.get('/', controller.getAllNotifications);
notificationRoutes.post('/new', controller.newNotification);

export = notificationRoutes;
