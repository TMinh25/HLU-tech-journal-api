import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.get('/', controller.getAllUsers);
router.get('/:_id', controller.getUser);
router.get('/score/:_id', controller.getUserScore);
router.post('/find', controller.findUser);

export = router;
