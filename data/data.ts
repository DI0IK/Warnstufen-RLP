import sheetReader from './sheetReader';
import parseDayTable, { DayTable, DistrictData } from './dayTableParser';

export default class DataFetcher {
	private _dayTables: {
		[key: string]: DayTable;
	} = {};

	private _startDate: Date = new Date(
		// 1st of August 2021
		2021,
		7,
		1
	);

	private constructor() {
		setInterval(() => {
			this.update();
		}, 10 * 60 * 1000);
	}

	private static _instance: DataFetcher;

	public static getInstance(): DataFetcher {
		if (!DataFetcher._instance) {
			DataFetcher._instance = new DataFetcher();
		}

		return DataFetcher._instance;
	}

	private update() {
		for (let i = Date.now(); i > this._startDate.getTime(); i -= 24 * 60 * 60 * 1000) {
			const date = new Date(i);

			// Dateformat: YYYY-MM-DD
			const reader = new sheetReader(
				`https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Rohdaten_2021/Corona-Fallmeldungen-RLP-${
					date.toISOString().split('T')[0]
				}.xlsx`
			);

			reader.on('sheet-updated', (sheet) => {
				const dayTable = parseDayTable(sheet);
				this._dayTables[
					date.toLocaleDateString('de-DE', {
						year: 'numeric',
						month: '2-digit',
						day: '2-digit',
					})
				] = dayTable;
			});
		}
	}

	public getDayTable(date: Date): DayTable {
		return this._dayTables[
			date.toLocaleDateString('de-DE', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
			})
		];
	}

	public getDayTableForToday(): DayTable {
		return this.getDayTable(new Date());
	}

	public getTablesForDistrict(district: string): { data: DistrictData; date: string }[] {
		let returnData: { data: DistrictData; date: string }[] = [];
		Object.entries(this._dayTables).forEach(([date, dayTable]) => {
			if (dayTable[district]) {
				returnData.push({
					data: dayTable[district],
					date,
				});
			}
		});
		return returnData;
	}

	public getDistricts(): string[] {
		return Object.values(this._dayTables).reduce((districts, dayTable) => {
			return [...districts, ...Object.keys(dayTable)];
		}, []);
	}

	public get isReady(): boolean {
		return Object.keys(this._dayTables).length > 0;
	}
}
