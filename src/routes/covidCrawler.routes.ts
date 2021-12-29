import express from 'express';
import controller from '../controllers/covidCrawler.controller';

const covidCrawlerRoutes = express.Router();

covidCrawlerRoutes.get('/', controller.crawlSummaryData);
covidCrawlerRoutes.get('/vietnam/province', controller.crawlVietNamProvinceData);
covidCrawlerRoutes.get('/countries', controller.crawlCountryList);
covidCrawlerRoutes.get('/countries/summary', controller.crawlCountriesSummary);
covidCrawlerRoutes.get('/country/:slug', controller.crawlCountrySummary);

export = covidCrawlerRoutes;
