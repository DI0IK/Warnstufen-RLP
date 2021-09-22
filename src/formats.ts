import express from 'express';

export interface Data {
	Date: string;
	Inzidenz7Tage: number;
	Hospitalisierung7Tage: number;
	IntensivbettenProzent: number;
	Gebiet: string;
	Warnstufe?: number;
}

export interface Config {
	excel_sheet: {
		url: string;
		sheet: string;
		start_row: number;
		end_row: number;
		start_column: number;
	};
	api: {
		httpsPort: number;
		httpPort: number;
		token: number;
	};
	ampel: {
		Inzidenz7Tage: number[];
		Hospitalisierung7Tage: number[];
		IntensivbettenProzent: number[];
		needed: number;
	};
	web: {
		RoutesFile: string;
	};
}

export interface Route {
	path: string;
	loginRequired: boolean;
	folderName: string;
	page: {
		cssFileNames: {
			type: 'mobile' | 'desktop' | 'both';
			fileName: string;
		}[];
		jsFileNames: {
			type: 'mobile' | 'desktop' | 'both';
			fileName: string;
		}[];
		htmlFileName: {
			type: 'mobile' | 'desktop' | 'both';
			fileName: string;
		}[];
		titles: {
			type: 'mobile' | 'desktop' | 'both';
			title: string;
		}[];
		replaceWholePage?: {
			type: 'mobile' | 'desktop' | 'both';
			fileName: string;
		}[];
	};
	pageCalls?: {
		ip: string;
		time: number;
		userAgent: any;
	}[];
}

export interface APIEndpoint {
	path: string;
	method: 'GET' | 'POST';
	handler: (req: express.Request, res: express.Response) => void;
	apiLimit?: number;
	apiCalls?: {
		ip: string;
		time: number;
	}[];
	authRequired?: boolean;
}
