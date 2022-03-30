import express from 'express';
import controller from '../controllers/journal.controller';

const journalRoutes = express.Router();

journalRoutes.get('/', controller.getAllJournals);
journalRoutes.get('/recent-published', controller.getRecentlyPublishedJournal);
journalRoutes.get('/published', controller.getAllPublishedJournal);
journalRoutes.get('/publishing', controller.getAllPublishingJournal);
journalRoutes.post('/:_journalGroupId/new', controller.createNewJournal);
journalRoutes.delete('/delete/:_id', controller.deleteJournal);
journalRoutes.post('/find', controller.findJournals);
journalRoutes.get('/:_id', controller.getJournalById);
journalRoutes.post('/add-article/:_id/:_articleId', controller.addArticleToJournal);
journalRoutes.post('/remove-article/:_id/:_articleId', controller.removeArticleToJournal);
journalRoutes.post('/published-journal/:_id', controller.publishedJournal);

journalRoutes.get('/:_id/articles', controller.getAllArticlesOfJournal);

export = journalRoutes;
