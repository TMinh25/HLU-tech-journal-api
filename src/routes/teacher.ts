import express from 'express';
import controller from '../controllers/teacher.controller';

const router = express.Router();

router.get('/get', controller.getAllTeachers);
router.post('/create', controller.createTeacherAccount);

export = router;
