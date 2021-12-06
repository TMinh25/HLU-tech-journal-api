import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import countryCode from '../data/countryCode.json';

const overviewURL = 'https://static.pipezero.com/covid/data.json';

const covid19API = 'https://api.covid19api.com';

const modifyCountryObject = (country: any): object => {
	return {
		name: country!.Country,
		ISO2: country!.CountryCode,
		slug: country!.Slug,
		newConfirmed: country!.NewConfirmed,
		totalConfirmed: country!.TotalConfirmed,
		newDeaths: country!.NewDeaths,
		totalDeaths: country!.TotalDeaths,
		newRecovered: country!.NewRecovered,
		totalRecovered: country!.TotalRecovered,
		lastUpdated: country!.Date
	};
};

const crawlSummaryData = async (req: Request, res: Response, next: NextFunction) => {
	const response = await fetch(overviewURL);
	const data = await response.json();
	var { total, today, overview } = data;

	// đổi tên internal thành vietnam
	delete Object.assign(total, { vietnam: total.internal }).internal;

	// đổi tên internal thành vietnam
	delete Object.assign(today, { vietnam: today.internal }).internal;

	const modifiedData = {
		total,
		today,
		overview
	};

	res.status(200).json({
		success: true,
		data: modifiedData
	});
};

const crawlVietNamProvinceData = async (req: Request, res: Response, next: NextFunction) => {
	const response = await fetch(overviewURL);
	const data = await response.json();

	res.status(200).json({
		success: true,
		data: data.locations
	});
};

const getCountryList = async (req: Request, res: Response, next: NextFunction) => {
	res.status(200).json({ success: true, data: countryCode });
};

const crawlCountriesSummary = async (req: Request, res: Response, next: NextFunction) => {
	const response = await fetch(covid19API + '/summary');
	const data = await response.json();

	var countries = data.Countries.map((country: any) => {
		return modifyCountryObject(country);
	});

	res.status(200).json({ success: true, data: countries });
};

const crawlCountrySummary = async (req: Request, res: Response, next: NextFunction) => {
	const countrySlug = req.params.slug;
	var countryData = null;

	if (countrySlug == 'vietnam') {
		const response = await fetch(overviewURL);
		const data = await response.json();
		var { total, today } = data;

		countryData = {
			name: 'Việt Nam',
			ISO2: 'VN',
			slug: 'vietnam',
			newConfirmed: today!.internal!.cases,
			totalConfirmed: total!.internal!.cases,
			newDeaths: today!.internal!.death,
			totalDeaths: total!.internal!.death,
			newRecovered: today!.internal!.recovered,
			totalRecovered: total!.internal!.recovered,
			lastUpdated: new Date()
		};
	} else {
		const response = await fetch(covid19API + '/summary');
		const data = await response.json();
		const countries: Array<any> = data.Countries;

		// find country with slug in countries data
		let countryData = countries.filter((country) => country.Slug == countrySlug)[0];

		// object modifying
		countryData = modifyCountryObject(countryData);
	}

	res.status(200).json({ success: true, data: countryData });
};

export default { crawlSummaryData, crawlVietNamProvinceData, crawlCountryList: getCountryList, crawlCountriesSummary, crawlCountrySummary };
