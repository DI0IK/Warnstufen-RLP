export interface config {
	excel_sheet: {
		url: string;
		sheet: string;
		startRow: number;
		endRow: number;
		startColumn: number;
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
};
