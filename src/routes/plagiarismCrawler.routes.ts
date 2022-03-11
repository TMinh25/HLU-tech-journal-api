import express from 'express';
import controller from '../controllers/plagiarismCrawler.controller';

const plagiarismRoutes = express.Router();

plagiarismRoutes.post('/', controller.crawlPlagium);

export = plagiarismRoutes;
