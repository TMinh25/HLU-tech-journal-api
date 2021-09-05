import { Request, Response, NextFunction } from 'express';
import Student from '../models/student.model';
import bcrypt from 'bcrypt';
import logging from '../config/logging';
import mongoose from 'mongoose';
import jwt from 'jwt-simple';
import config from '../config/config';

const NAMESPACE = 'Student Controller';

const getAllStudents = (req: Request, res: Response, next: NextFunction) => {
	Student.find()
		.exec()
		.then((studentRes) =>
			res.status(200).json({
				students: studentRes,
				count: studentRes.length
			})
		)
		.catch((error) =>
			res.status(500).json({
				message: error.message,
				e: error
			})
		);
};

const createStudentAccount = (req: Request, res: Response, next: NextFunction) => {
	req.body.password = bcrypt.hashSync(req.body.password, 10);
	let { studentID, name, DOB, password, photoURL, extraInformation } = req.body;
	const student = new Student({
		_id: new mongoose.Types.ObjectId(),
		studentID,
		name,
		DOB,
		password,
		photoURL,
		extraInformation
	});

	return student
		.save()
		.then((result) => {
			return res.status(201).json({ success: true, student: result });
		})
		.catch((error) =>
			res.status(500).json({
				success: false,
				message: error.message,
				e: error
			})
		);
};

const authStudent = async (req: Request, res: Response, next: NextFunction) => {
	try {
		var student = await Student.findOne({ studentID: req.body.studentID }).exec();
		if (!student) {
			return res.status(400).send({ message: 'Người dùng không tồn tại' });
		}
		if (!bcrypt.compareSync(req.body.password, student.password)) {
			return res.status(400).send({ message: 'Mật khẩu của tài khoản không đúng' });
		}
		let token = jwt.encode(student, config.jwt_key, 'HS512');
		res.send({ authenticated: true, token });
	} catch (error) {
		res.status(500).send(error);
	}
};

export default { getAllStudents, createStudentAccount, authStudent };
