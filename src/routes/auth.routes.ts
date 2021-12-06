import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.post('/signup', controller.signUp);
router.post('/signin', controller.signIn);
router.delete('/signout', controller.signOut);
router.get('/info', controller.authInfo);
router.get('/access-token', controller.getAccessToken);
router.delete('/:_id', controller.deleteUser);

export = router;
