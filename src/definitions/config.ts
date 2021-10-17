import fs from 'fs';

export interface config {
	excel_sheet: {
		url: string;
		sheet: string;
		startRow: number;
		endRow: number;
		startColumn: number;
		updateInterval: number;
	};
	api: {
		httpsPort: number;
		httpPort: number;
		secret: string;
	};
	ampel: {
		Inzidenz7Tage: number[];
		Hospitalisierung7Tage: number[];
		IntensivbettenProzent: number[];
		needed: number;
	};
	links: {
		github: string;
		author: string;
	};
}

export const config = JSON.parse(fs.readFileSync('/config.json').toString()) as config;
