import express from 'express';
import controller from '../controllers/student.controller';

const router = express.Router();

router.get('/get', controller.getAllStudents);
router.post('/create', controller.createStudentAccount);
router.post('/auth', controller.authStudent);

export = router;
