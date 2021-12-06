import express from 'express';
import controller from '../controllers/covidCrawler.controller';

const router = express.Router();

router.get('/', controller.crawlSummaryData);
router.get('/vietnam/province', controller.crawlVietNamProvinceData);
router.get('/countries', controller.crawlCountryList);
router.get('/countries/summary', controller.crawlCountriesSummary);
router.get('/country/:slug', controller.crawlCountrySummary);

export = router;
