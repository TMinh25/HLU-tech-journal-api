import express from 'express';
import controller from '../controllers/user.controller';
import { tokenAuthorization } from '../middlewares/tokenAuthorization';

const authRoutes = express.Router();

authRoutes.post('/signup', controller.signUp);
authRoutes.post('/signin', controller.signIn);
authRoutes.delete('/signout', tokenAuthorization, controller.signOut);
authRoutes.get('/info', tokenAuthorization, controller.authInfo);
authRoutes.post('/access-token', controller.getAccessToken);
authRoutes.get('/verification/:verificationId', controller.verifyAccount);
authRoutes.post('/password-reset', controller.requestResetPassword);
authRoutes.post('/password-reset/:userId/:token', controller.resetPassword);
authRoutes.get('/password-reset/:userId/:token', controller.isValidResetPassword);

export = authRoutes;
