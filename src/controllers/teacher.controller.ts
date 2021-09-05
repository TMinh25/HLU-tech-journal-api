import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Teacher from '../models/teacher.model';
import logging from '../config/logging';

const NAMESPACE = 'Teacher Controller';

const getAllTeachers = (req: Request, res: Response, next: NextFunction) => {
	Teacher.find()
		.exec()
		.then((studentRes) =>
			res.status(201).json({
				teachers: studentRes,
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

const createTeacherAccount = (req: Request, res: Response, next: NextFunction) => {
	req.body.password = bcrypt.hashSync(req.body.password, 10);
	let { name, DOB, email, password, photoURL, extraInformation } = req.body;
	try {
		const teacher = new Teacher({
			_id: new mongoose.Types.ObjectId(),
			email,
			name,
			DOB,
			password,
			photoURL,
			extraInformation
		});
		return teacher
			.save()
			.then((result) => {
				return res.status(201).json({ success: true, teacher: result });
			})
			.catch((error) =>
				res.status(500).json({
					success: false,
					message: error.message,
					e: error
				})
			);
	} catch (error) {
		console.log(error);
	}
};

export default { getAllTeachers, createTeacherAccount };
