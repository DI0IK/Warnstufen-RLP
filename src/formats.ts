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
		limit: number;
	};
	ampel: {
		Inzidenz7Tage: number[];
		Hospitalisierung7Tage: number[];
		IntensivbettenProzent: number[];
		needed: number;
	};
}
