import express from 'express';
import journalGroupController from '../controllers/journalGroup.controller';

const journalGroupRoutes = express.Router();

journalGroupController;

journalGroupRoutes.get('/', journalGroupController.getAllJournalGroups);
journalGroupRoutes.post('/:_id/submission', journalGroupController.articleSubmissions);
journalGroupRoutes.post('/new', journalGroupController.newJournalGroup);
journalGroupRoutes.patch('/:_id', journalGroupController.modifyJournalGroup);
journalGroupRoutes.delete('/:_id', journalGroupController.deleteJournalGroup);
journalGroupRoutes.get('/:_id/journals', journalGroupController.getAllJournalsInGroup);

export = journalGroupRoutes;
