import puppeteer, { ElementHandle, WaitForSelectorOptions } from 'puppeteer';
import { NextFunction, Request, Response } from 'express';
import PlagiarismModel from '../interfaces/plagiarism';
import { removeBreadScrumbs, cleanDescription as cleanString } from '../utils';
import logger from '../config/logger';

const NAMESPACE = 'plagiarismCrawlerController';

// const getDataFromResultsElement = (removeBreadScrumbs: Function, cleanString: Function) =>
// 	Array.from(document.querySelectorAll('div.result'), (element) => {
// 		const titleLink = element.querySelector('a.title');
// 		const descriptionSpan = element.querySelector('p > span.description');
// 		const similarPercentSpan = element.querySelector('p > span.info > span.rank > span.badge');
// 		const similarFoundSpan = element.querySelector('p > span.info > span.found > span.badge');
// 		return {
// 			plagTitle: removeBreadScrumbs(titleLink?.textContent),
// 			plagUrl: titleLink?.getAttribute('href'),
// 			plagDescription: cleanString(descriptionSpan?.textContent),
// 			similarityPercent: Number(similarPercentSpan?.textContent?.replace('%', '')),
// 			similarityFound: Number(similarFoundSpan?.textContent),
// 		};
// 	});

const crawlPlagium = async (req: Request, res: Response, next: NextFunction) => {
	// return res.status(200).json({
	// 	success: true,
	// 	data: [
	// 		{
	// 			title: 'PDF]Preparation and property assessment of eco-friendly ...',
	// 			url: 'https://tailieumienphi.vn/doc/preparation-and-property-assessment-of-eco-friendly-composite-based-on-polyvinyl-irfhuq.html',
	// 			description:
	// 				'Biodegradable composite films, based on polyvinyl alcohol (PVA) and lignin extracted from sugar bagasse, were fabricated with various weight ratios between two components. The composites show adequate characteristics contributed by PVA and lignin which have specific functional groups revealed by Infrared spectroscopy (FTIR).',
	// 			similarityPercent: 98.8,
	// 			similarityFound: 4,
	// 		},
	// 		{
	// 			title: 'PREPARATION AND PROPERTY ASSESSMENT OF ECO-FRIENDLY COMPOSITE ...',
	// 			url: 'http://jst.tnu.edu.vn/jst/article/download/3775/pdf',
	// 			description:
	// 				'weight ratios between two components. The composites show adequate characteristics contributed by PVA and lignin which have specific functional groups revealed by Infrared spectroscopy (FTIR). In addition, the composites possess outstanding characteristics including comparable optical and mechanical properties investigated',
	// 			similarityPercent: 93.2,
	// 			similarityFound: 3,
	// 		},
	// 		{
	// 			title: 'PREPARATION AND PROPERTY ASSESSMENT OF ECO-FRIENDLY COMPOSITE ...',
	// 			url: 'https://www.semanticscholar.org/paper/PREPARATION-AND-PROPERTY-ASSESSMENT-OF-ECO-FRIENDLY-Nguy%C3%AAn-Tr%E1%BB%B1/6ce36feb90c7e942c33e96dcf36e63a919f1f760',
	// 			description:
	// 				'Received: 12/11/2020 Biodegradable composite films, based on polyvinyl alcohol (PVA) and lignin extracted from sugar bagasse, were fabricated with various weight ratios between two components. The composites show adequate characteristics contributed by PVA and lignin which have specific functional groups revealed by Infrared spectroscopy (FTIR). In addition, the composites possess outstanding ...',
	// 			similarityPercent: 55.4,
	// 			similarityFound: 2,
	// 		},
	// 		{
	// 			title: 'Preparation and property assessment of eco-friendly composite ...',
	// 			url: 'https://tailieu.vn/doc/preparation-and-property-assessment-of-eco-friendly-composite-based-on-polyvinyl-alcohol-and-lignin--2405063.html',
	// 			description:
	// 				'Biodegradable composite films, based on polyvinyl alcohol (PVA) and lignin extracted from sugar bagasse, were fabricated with various weight ratios between two components. The composites show adequate characteristics contributed by PVA and lignin which have specific functional groups revealed by Infrared spectroscopy (FTIR). In addition, the composites possess outstanding characteristics ...',
	// 			similarityPercent: 25.9,
	// 			similarityFound: 1,
	// 		},
	// 		{
	// 			title: 'PDF] EXTRACTION OF LIGNIN FROM SUGARCANE BAGASSE BY DEEP ...',
	// 			url: 'https://www.semanticscholar.org/paper/EXTRACTION-OF-LIGNIN-FROM-SUGARCANE-BAGASSE-BY-DEEP-Nguyen-Tr%E1%BB%B1/b62f83a9869b570b2622ea781ddc90672ddabdf1',
	// 			description:
	// 				'Received: 12/11/2020 Biodegradable composite films, based on polyvinyl alcohol (PVA) and lignin extracted from sugar bagasse, were fabricated with various weight ratios between two components. The … Expand',
	// 			similarityPercent: 15.4,
	// 			similarityFound: 0,
	// 		},
	// 	],
	// });

	var text: string = req.body.text;

	text = cleanString(text);

	if (text.split('').length > 1000) {
		return res.status(400).json({ success: false, message: 'Đoạn văn giới hạn ở 1000 kí tự' });
	} else if (text.split('').length < 50) {
		return res.status(400).json({ success: false, message: 'Đoạn văn quá ngắn để tìm dữ liệu' });
	}
	try {
		// Tạo trang mới trong tab ẩn danh
		const browser = await puppeteer.launch({ headless: false });
		const incognitoContext = await browser.createIncognitoBrowserContext();
		const page = await incognitoContext.newPage();
		await page.goto('https://www.plagium.com/');
		await page.setViewport({ height: 1080, width: 1080 });
		await page.type("textarea[id='text']", text);
		await page.click("button[id='btnQuickSearch']");

		const result = await page.evaluate("document.querySelector('div#message').textContent.includes('Plagium did not find documents making use of the text that you entered.')");

		if (result === true)
			return res.status(404).json({ success: true, data: null, message: 'Did not find any documents making use of the text', message_vn: 'Không tìm thấy tài liệu nào sử dụng đoạn văn bản' });
		try {
			// Đợi đến khi các kết quả hiện ra, thời gian timeout là 3 phút
			await page.waitForSelector('.result', {
				timeout: 180000,
				visible: true,
			});

			// Lấy dữ liệu từ các .result tìm được
			const data = await page.evaluate(() =>
				// document.querySelector('div#message').textContent.includes('Plagium did not find documents making use of the text that you entered.')
				{
					const falseResult = document.querySelector('div#message')?.textContent?.includes('Plagium did not find documents making use of the text that you entered.');
					if (falseResult) {
						return [];
					}

					return Array.from(document.querySelectorAll('div.result'), (element) => {
						const titleLink = element.querySelector('a.title');
						const descriptionSpan = element.querySelector('p > span.description');
						const similarPercentSpan = element.querySelector('p > span.info > span.rank > span.badge');
						const similarFoundSpan = element.querySelector('p > span.info > span.found > span.badge');
						return {
							title: titleLink?.textContent || '',
							url: titleLink?.getAttribute('href'),
							description: descriptionSpan?.textContent || '',
							similarityPercent: Number(similarPercentSpan?.textContent?.replace('%', '')),
							similarityFound: Number(similarFoundSpan?.textContent),
						};
					});
				},
			);

			if (data.length == 0) {
				// Không có bản đạo văn nào
				res.status(404).json({
					success: true,
					message: 'Không tìm thấy tài liệu nào sử dụng đoạn văn bản',
				});
			} else {
				// Chỉnh sửa lại dữ liệu lần cuối
				const finalData = data.map((element) => {
					return {
						...element,
						title: removeBreadScrumbs(element.title || ''),
						description: cleanString(element.description || ''),
					};
				}) as Array<PlagiarismModel>;
				// Trả về kết quả của các bản đạo văn
				res.status(200).json({
					success: true,
					data: finalData,
				});
			}
			// Đóng trình duyệt
			browser.close();
			return;
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Quá thời gian chờ 3 phút' });
		}
	} catch (error) {
		logger.error(NAMESPACE, 'error', error);
		return res.status(400).json({ success: false, error });
	}
};

export default { crawlPlagium };
