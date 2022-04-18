import getSheet from './sheetReader';
import parseDayTable, { DayTable, DistrictData } from './dayTableParser';

export default class DataFetcher {
	private _dayTables: {
		[key: string]: DayTable;
	} = {};

	private _startDate = new Date('2021-08-01T00:00:00.000Z');

	private constructor() {
		this.init();
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

	private async init() {
		const datesBetween = (start: Date, end: Date) => {
			const dates = [];
			let currentDate = start;
			while (currentDate <= end) {
				dates.push(new Date(currentDate));
				currentDate.setDate(currentDate.getDate() + 1);
			}
			dates.push(end);
			return dates;
		};
		const nowDate = new Date(
			new Date().getFullYear() +
				'-' +
				('0' + (new Date().getMonth() + 1).toString()).slice(-2) +
				'-' +
				('0' + new Date().getDate()).slice(-2) +
				'T00:00:00.000Z'
		);
		for (const date of datesBetween(this._startDate, nowDate) as Date[]) {
			const url = `https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Rohdaten_${
				date.getFullYear() === 2021
					? '2021'
					: this.getMonthName(date.getMonth()) + '_' + date.getFullYear()
			}/Corona-Fallmeldungen-RLP-${date.toISOString().split('T')[0]}.xlsx`;

			// Dateformat: YYYY-MM-DD
			const sheet = await getSheet(url, 'Tabelle1');

			const dayTable = parseDayTable(sheet, date);
			if (!dayTable) continue;
			this._dayTables[
				date.toLocaleDateString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					timeZone: 'UTC',
				})
			] = dayTable;
		}
	}

	private async update() {
		const date = new Date();

		const url = `https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Rohdaten_${
			date.getFullYear() === 2021
				? '2021'
				: this.getMonthName(date.getMonth()) + '_' + date.getFullYear()
		}/Corona-Fallmeldungen-RLP-${date.toISOString().split('T')[0]}.xlsx`;

		const sheet = await getSheet(url, 'Tabelle1');

		const dayTable = parseDayTable(sheet, date);
		if (!dayTable) return;
		this._dayTables[
			date.toLocaleDateString('de-DE', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				timeZone: 'UTC',
			})
		] = dayTable;
	}

	public getDayTable(date: Date): DayTable {
		return this._dayTables[
			date.toLocaleDateString('de-DE', {
				year: 'numeric',
				month: '2-digit',
				day: '2-digit',
				timeZone: 'UTC',
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
		return returnData.sort((a, b) => {
			return (
				new Date(a.date.split('.').reverse().join('-')).getTime() -
				new Date(b.date.split('.').reverse().join('-')).getTime()
			);
		});
	}

	public getDistricts(): string[] {
		return Object.values(this._dayTables)
			.reduce((districts, dayTable) => {
				return [...districts, ...Object.keys(dayTable)];
			}, [])
			.filter((district, index, array) => {
				return array.indexOf(district) === index;
			});
	}

	public get isReady(): boolean {
		const nowDate = new Date(
			new Date().getFullYear() +
				'-' +
				('0' + (new Date().getMonth() + 1).toString()).slice(-2) +
				'-' +
				('0' + new Date().getDate()).slice(-2) +
				'T00:00:00.000Z'
		);
		return (
			Object.keys(this._dayTables).includes(
				nowDate.toLocaleDateString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					timeZone: 'UTC',
				})
			) ||
			Object.keys(this._dayTables).includes(
				new Date(nowDate.setDate(nowDate.getDate() - 1)).toLocaleDateString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					timeZone: 'UTC',
				})
			) ||
			Object.keys(this._dayTables).includes(
				new Date(nowDate.setDate(nowDate.getDate() - 2)).toLocaleDateString('de-DE', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					timeZone: 'UTC',
				})
			)
		);
	}

	private getMonthName(month: number): string {
		return [
			'Januar',
			'Februar',
			'Maerz',
			'April',
			'Mai',
			'Juni',
			'Juli',
			'August',
			'September',
			'Oktober',
			'November',
			'Dezember',
		][month];
	}
}
