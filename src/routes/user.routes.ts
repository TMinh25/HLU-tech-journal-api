import express from 'express';
import userController from '../controllers/user.controller';
import tempReviewerController from '../controllers/tempReviewer.controller';

const userRoutes = express.Router();

userRoutes.get('/temp-reviewer', tempReviewerController.getAllTempReviewers);
userRoutes.post('/temp-reviewer/new', tempReviewerController.newTempReviewer);
userRoutes.delete('/temp-reviewer/:_id', tempReviewerController.removeTempReviewer);

userRoutes.get('/', userController.getAllUsers);
userRoutes.get('/review-fields', userController.getAllReviewFields);
userRoutes.post('/find', userController.findUsers);
userRoutes.patch('/disable/:_id', userController.toggleDisableUser);
userRoutes.get('/:_id', userController.getUser);
userRoutes.delete('/:_id', userController.deleteUser);

export = userRoutes;
