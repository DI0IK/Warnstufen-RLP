export interface config {
	excel_sheet: {
		url: string;
		sheet: string;
		startRow: number;
		endRow: number;
		startColumn: number;
	};
	ampel: {
		Inzidenz7Tage: number[];
		Hospitalisierung7Tage: number[];
		IntensivbettenProzent: number[];
		needed: number;
	};
}

export const config: config = {
	excel_sheet: {
		url: 'https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Listen/Leitindikatoren_Corona-Warnstufen.xlsx',
		sheet: 'COVID-Leitindikatoren RLP',
		startRow: 4,
		endRow: 45,
		startColumn: 2,
	},
	ampel: {
		Inzidenz7Tage: [0, 100, 200],
		Hospitalisierung7Tage: [0, 4.99, 10],
		IntensivbettenProzent: [0, 6, 12],
		needed: 2,
	},
};
