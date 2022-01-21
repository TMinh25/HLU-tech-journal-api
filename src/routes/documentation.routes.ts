import express, { NextFunction, Request, Response } from 'express';
import controller from '../controllers/fileStorage.controller';
import { paramsIsValidMongoID } from '../middlewares/paramsValidation';

const NAMESPACE = 'DocumentationRoutes';

const fileStorageRoutes = express.Router();

// TODO: viết documentation cho api
fileStorageRoutes.get('/', (req: Request, res: Response, next: NextFunction) => {});

export = fileStorageRoutes;
