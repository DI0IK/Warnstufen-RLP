import axios from 'axios';
import exceljs from 'exceljs';
import { config } from './definitions/config';
import { APIData, APIDate } from './definitions/data';
import {
	District,
	APIDistrict,
	VersorgungsgebieteDistricts,
	RLPDistrict,
} from './definitions/districts';

export class Reader {
	private _workbook: exceljs.Workbook = new exceljs.Workbook();
	private _url: string;
	private _data: APIData | undefined;
	private onupdate: (data: APIData) => void;

	private static instance: Reader;

	private constructor(updateInterval: number, onupdate: (data: APIData) => void) {
		this._url = config.excel_sheet.url;
		this.onupdate = onupdate;
		this.update();

		setInterval(() => {
			this.update();
		}, updateInterval);
	}

	public static getInstance(updateInterval: number, onupdate: (data: APIData) => void) {
		if (!Reader.instance) {
			Reader.instance = new Reader(updateInterval, onupdate);
		}
		return Reader.instance;
	}

	public update() {
		axios
			.get(this._url, { responseType: 'arraybuffer' })
			.then((response) => {
				this._workbook.xlsx.load(response.data as any).then(() => {
					if (this._data && this._data.data) this._data.data = {} as any;
					this.sheetToData();
					this.calculateWarnstufe();
					this.onupdate(this._data as APIData);
				});
			})
			.catch((error) => {
				console.log('Unable to fetch Sheet (Code: ' + error.response.status + ')');
			});
	}

	public get data(): { v2: APIData; v1: any } | undefined {
		if (this._data) {
			let dataToSend: {
				Gebiet: APIDistrict;
				Inzidenz7Tage: number;
				Hospitalisierung7Tage: number;
				IntensivbettenProzent: number;
				Date: string;
				Warnstufe: number;
			}[] = [];

			for (const district of APIDistrict) {
				const districtData = this._data.data[district as District];
				if (!districtData) continue;

				for (const date of Object.keys(districtData)) {
					const data = districtData[date as APIDate];

					dataToSend.push({
						Gebiet: district as APIDistrict,
						Inzidenz7Tage: data.Inzidenz7Tage,
						Hospitalisierung7Tage: data.Hospitalisierung7Tage,
						IntensivbettenProzent: data.IntensivbettenProzent,
						Date: new Date(
							Number.parseInt(date.split('.')[2]),
							Number.parseInt(date.split('.')[1]) - 1,
							Number.parseInt(date.split('.')[0])
						).toLocaleDateString(),
						Warnstufe: data.Warnstufe,
					});
				}
			}

			dataToSend.sort((a, b) => {
				return new Date(a.Date).getTime() - new Date(b.Date).getTime();
			});
			return {
				v2: this._data,
				v1: dataToSend,
			};
		}
	}

	public get districs(): string[] {
		return APIDistrict;
	}

	private sheetToData() {
		const sheet = this._workbook.getWorksheet(config.excel_sheet.sheet);
		for (
			let districtNum = config.excel_sheet.startRow;
			districtNum <= config.excel_sheet.endRow;
			districtNum++
		) {
			const district = sheet.getRow(districtNum).getCell(1).value;
			for (
				let dateNum = config.excel_sheet.startColumn;
				dateNum <= sheet.getRow(districtNum).cellCount;
				dateNum += 3
			) {
				const date = sheet.getRow(1).getCell(dateNum).text.split(' ')[1];
				const Inzidenz7Tage = sheet.getRow(districtNum).getCell(dateNum).value as number;
				const Hospitalisierung7Tage = sheet.getRow(districtNum).getCell(dateNum + 1)
					.value as number;
				const IntensivbettenProzent = sheet.getRow(districtNum).getCell(dateNum + 2)
					.value as number;

				let districtName: District = district as District;
				if (typeof districtName !== 'string')
					districtName = (district as exceljs.CellRichTextValue).richText[0].text as District;
				districtName = districtName.replace(/\n/g, '') as District;

				if (!this._data) {
					this._data = {
						data: {} as any,
					};
				}

				if (!this._data.data[districtName]) {
					this._data.data[districtName] = {};
				}

				this._data.data[districtName][date as APIDate] = {
					Inzidenz7Tage,
					Hospitalisierung7Tage,
					IntensivbettenProzent,
					Warnstufe: 0,
					WarnstufeNurEinTag: 0,
					Versorgungsgebiet: '',
				};
			}
		}
	}

	private calculateWarnstufe() {
		if (!this._data) return;

		let VersorgungsgebietName: VersorgungsgebieteDistricts = '' as any;
		for (let districtName in this._data.data) {
			const district = this._data.data[districtName as District];
			let lastDate: Date;
			const dates = Object.keys(district).sort((a, b) => {
				const dateObjA = new Date(a.split('.').reverse().join('-') + 'T00:00:00.000Z');
				const dateObjB = new Date(b.split('.').reverse().join('-') + 'T00:00:00.000Z');
				return dateObjA.getTime() - dateObjB.getTime();
			});
			for (let date of dates) {
				if (
					VersorgungsgebieteDistricts.includes(districtName as District) ||
					RLPDistrict.includes(districtName as District)
				) {
					VersorgungsgebietName = districtName as VersorgungsgebieteDistricts;
				}

				if (
					APIDistrict.includes(districtName as District) ||
					RLPDistrict.includes(districtName as District)
				) {
					const RLPIntensivbettenProzent =
						this._data.data[RLPDistrict[0] as District][date as APIDate]
							.IntensivbettenProzent;

					const data = district[date as APIDate];

					data.Hospitalisierung7Tage =
						this._data.data[VersorgungsgebietName][date as APIDate].Hospitalisierung7Tage;
					data.IntensivbettenProzent = RLPIntensivbettenProzent;

					data.Versorgungsgebiet = VersorgungsgebietName;

					const InzidenzLevel =
						data.Inzidenz7Tage > 200 ? 3 : data.Inzidenz7Tage > 100 ? 2 : 1;

					const HospitalisierungLevel =
						data.Hospitalisierung7Tage > 10 ? 3 : data.Hospitalisierung7Tage >= 5 ? 2 : 1;

					const IntensivbettenLevel =
						data.IntensivbettenProzent > 12 ? 3 : data.IntensivbettenProzent >= 6 ? 2 : 1;

					let dayLevel = 1;

					for (let level = 1; level <= 3; level++) {
						let count = 0;
						if (InzidenzLevel >= level) count++;
						if (HospitalisierungLevel >= level) count++;
						if (IntensivbettenLevel >= level) count++;
						if (count >= 2) dayLevel = level;
					}

					const dateObj = new Date(date.split('.').reverse().join('-') + 'T00:00:00.000Z');

					if (!lastDate) lastDate = dateObj;
					if (lastDate.getTime() < dateObj.getTime()) lastDate = dateObj;

					data.Warnstufe = dayLevel;
				}
			}
		}

		for (let districtName in this._data.data) {
			if (VersorgungsgebieteDistricts.includes(districtName as District)) {
				delete this._data.data[districtName as District];
			}
		}

		for (let districtName in this._data.data) {
			let currentWarnstufe = 1;
			let newWarnstufe = 1;
			let sameWarnstufeCount = 0;

			let lastDate: Date;
			let dayshift = [1];

			const dates = Object.keys(this._data.data[districtName as District]).sort((a, b) => {
				const dateObjA = new Date(a.split('.').reverse().join('-') + 'T00:00:00.000Z');
				const dateObjB = new Date(b.split('.').reverse().join('-') + 'T00:00:00.000Z');
				return dateObjA.getTime() - dateObjB.getTime();
			});

			for (let date of dates) {
				lastDate = new Date(date.split('.').reverse().join('-') + 'T00:00:00.000Z');

				const item = this._data.data[districtName as District][date as APIDate];

				if (item.Warnstufe === currentWarnstufe) {
					sameWarnstufeCount++;
				} else {
					currentWarnstufe = item.Warnstufe;
					sameWarnstufeCount = 1;
				}

				if (sameWarnstufeCount >= 3) {
					newWarnstufe = currentWarnstufe;
				}

				item.WarnstufeNurEinTag = item.Warnstufe;
				dayshift.push(newWarnstufe);
				item.Warnstufe = dayshift.shift();
			}

			let nextDate = new Date(lastDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString(
				'de-DE',
				{
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
				}
			);

			this._data.data[districtName as District] = {
				[nextDate]: {
					Inzidenz7Tage: null,
					Hospitalisierung7Tage: null,
					IntensivbettenProzent: null,
					Versorgungsgebiet: districtName as VersorgungsgebieteDistricts,
					Warnstufe: dayshift.shift(),
					WarnstufeNurEinTag: null,
				},
				...this._data.data[districtName as District],
			};
		}

		if (config.ganzRlpEineWarnstufe) {
			for (let districtName in this._data.data) {
				if (APIDistrict.includes(districtName as District)) {
					for (let date in this._data.data[districtName as District]) {
						this._data.data[districtName as District][date as APIDate].Warnstufe =
							this._data.data['Rheinland-Pfalz'][date as APIDate].Warnstufe;
						this._data.data[districtName as District][date as APIDate].WarnstufeNurEinTag =
							this._data.data['Rheinland-Pfalz'][date as APIDate].WarnstufeNurEinTag;
					}
				}
			}
		}
	}
}
