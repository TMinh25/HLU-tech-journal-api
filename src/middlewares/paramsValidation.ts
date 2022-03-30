import { NextFunction, Request, Response } from 'express';
import { validObjectID } from '../utils';

export const paramsIsValidMongoID = (req: Request, res: Response, next: NextFunction, params: string[]) => {
	const everyParamsIsValid = params.every((param) => validObjectID(req.params[param]));

	if (everyParamsIsValid) {
		next();
	} else {
		var invalidParams: string[] = [];
		params.forEach((param) => {
			if (!validObjectID(req.params[param])) {
				invalidParams.push(param);
			}
		});
		return res.status(400).json({ success: false, message: 'params is not valid mongo ID', invalidParams });
	}
};

export const queryIsValidMongoID = (req: Request, res: Response, next: NextFunction, querys: string[]) => {};
