import express from 'express';
import controller from '../controllers/journal.controller';

const journalRoutes = express.Router();

journalRoutes.get('/', controller.getAllJournals);
journalRoutes.get('/recent-published', controller.getRecentlyPublishedJournal);
journalRoutes.get('/published', controller.getAllPublishedJournal);
journalRoutes.get('/publishing', controller.getAllPublishedJournal);
journalRoutes.post('/new', controller.createNewJournal);
journalRoutes.delete('/delete/:_id', controller.deleteJournal);
journalRoutes.post('/find', controller.findJournals);
journalRoutes.get('/:_id', controller.getJournalById);
journalRoutes.post('/submission/:_id', controller.articleSubmissions);

export = journalRoutes;
