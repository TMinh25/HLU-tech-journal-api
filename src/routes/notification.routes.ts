import express from 'express';
import controller from '../controllers/notification.controller';

const notificationRoutes = express.Router();

notificationRoutes.post('/new', controller.newNotification);
notificationRoutes.get('/', controller.getAllNotifications);
notificationRoutes.get('/:_id', controller.getNotification);

export = notificationRoutes;
