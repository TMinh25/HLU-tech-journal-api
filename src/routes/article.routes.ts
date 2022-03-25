import express from 'express';
import controller from '../controllers/article.controller';

const articleRoutes = express.Router();

articleRoutes.get('/', controller.getAllArticles);
articleRoutes.post('/', controller.getArticles);
articleRoutes.get('/get/reviewer', controller.getArticlesForReviewer);
articleRoutes.get('/get/author/:_userId', controller.getArticlesForAuthor);
articleRoutes.get('/:_id', controller.getArticle);
articleRoutes.post('/:_id/submission/response', controller.submissionResponse);
articleRoutes.post('/:_id/submission/review/request', controller.requestReviewer);
articleRoutes.post('/:_id/submission/:_roundId/review/response', controller.reviewerResponse);
articleRoutes.post('/:_id/submission/:_roundId/review/unassign', controller.unassignReviewStage);
articleRoutes.post('/:_id/submission/:_roundId/review/result', controller.reviewerSubmitResult);
articleRoutes.post('/:_id/submission/:_roundId/review/confirm', controller.confirmedSubmittedResult);
articleRoutes.post('/:_id/submission/publishing', controller.publishingArticle);
articleRoutes.post('/:_id/submission/copyediting', controller.copyEditingArticle);
articleRoutes.post('/:_id/submission/completed', controller.completeArticle);
articleRoutes.post('/:_id/revision/request', controller.requestRevision);
articleRoutes.post('/:_id/revision/response/:_revisionId', controller.responseRevision);
articleRoutes.patch('/:_id/submission/visible', controller.toggleVisibleArticle);

export = articleRoutes;
