import express from 'express';
import controller from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.get('/', controller.getAllUsers);
userRoutes.get('/review-fields', controller.getAllReviewFields);
userRoutes.post('/find', controller.findUsers);
userRoutes.patch('/disable/:_id', controller.toggleDisableUser);
userRoutes.get('/:_id', controller.getUser);
userRoutes.delete('/:_id', controller.deleteUser);

export = userRoutes;
