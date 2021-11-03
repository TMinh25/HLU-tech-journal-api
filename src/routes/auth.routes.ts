import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.post('/signup', controller.signUp);
router.post('/signin', controller.signIn);
router.get('/info', controller.authInfo);
router.get('/access-token', controller.getAccessToken);
router.delete('/logout', controller.logout);
router.delete('/:_id', controller.deleteUser);

export = router;
