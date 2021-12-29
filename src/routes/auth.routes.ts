import express from 'express';
import controller from '../controllers/user.controller';

const authRoutes = express.Router();

authRoutes.post('/signup', controller.signUp);
authRoutes.post('/signin', controller.signIn);
authRoutes.delete('/signout', controller.signOut);
authRoutes.get('/info', controller.authInfo);
authRoutes.get('/access-token', controller.getAccessToken);

export = authRoutes;
