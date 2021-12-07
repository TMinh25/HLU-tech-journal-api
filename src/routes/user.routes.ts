import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.get('/', controller.getAllUsers);
router.get('/:_id', controller.getUser);
router.post('/find', controller.findUsers);

export = router;
