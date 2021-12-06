import express from 'express';
import controller from '../controllers/notification.controller';
import { route } from './user.routes';

const router = express.Router();

router.post('/send/token/:token', controller.sendNotificationToken);
router.post('/send/topic/:topic', controller.sendNotificationTopic); // gửi cho các người dùng đã sub channel như thông báo toàn trường, thông báo toàn khoa

export = router;
