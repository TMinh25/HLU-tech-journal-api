import express from 'express';
import controller from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.get('/', controller.getAllUsers);
userRoutes.get('/:_id', controller.getUser);
userRoutes.post('/find', controller.findUsers);
userRoutes.delete('/:_id', controller.deleteUser);

export = userRoutes;
