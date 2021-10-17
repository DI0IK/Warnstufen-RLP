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

	constructor(updateInterval: number, onupdate: (data: APIData) => void) {
		this._url = config.excel_sheet.url;
		this.onupdate = onupdate;
		this.update();

		setInterval(() => {
			this.update();
		}, updateInterval);
	}

	public update() {
		axios.get(this._url, { responseType: 'arraybuffer' }).then((response) => {
			this._workbook.xlsx.load(response.data).then(() => {
				this.sheetToData();
				this.calculateWarnstufe();
				this.onupdate(this._data as APIData);
			});
		});
	}

	public get data(): APIData | undefined {
		return this._data;
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
						github: config.links.github,
						author: config.links.author,
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
				};
			}
		}
	}

	private calculateWarnstufe() {
		if (!this._data) return;

		for (let districtName in this._data.data) {
			const district = this._data.data[districtName as District];
			let temp = [1, 1];
			let VersorgungsgebietHospitalisierung7Tage = 0;
			for (let date in district) {
				if (
					VersorgungsgebieteDistricts.includes(districtName as District) ||
					RLPDistrict.includes(districtName as District)
				) {
					const data = district[date as APIDate];
					VersorgungsgebietHospitalisierung7Tage = data.Hospitalisierung7Tage;
				}

				if (
					APIDistrict.includes(districtName as District) ||
					RLPDistrict.includes(districtName as District)
				) {
					const RLPIntensivbettenProzent =
						this._data.data[RLPDistrict[0] as District][date as APIDate]
							.IntensivbettenProzent;

					const data = district[date as APIDate];
					const ampel = config.ampel;

					data.Hospitalisierung7Tage = VersorgungsgebietHospitalisierung7Tage;
					data.IntensivbettenProzent = RLPIntensivbettenProzent;

					const InzidenzLevel =
						data.Inzidenz7Tage > ampel.Inzidenz7Tage[0]
							? 1
							: data.Inzidenz7Tage > ampel.Inzidenz7Tage[1]
							? 2
							: 3;

					const HospitalisierungLevel =
						data.Hospitalisierung7Tage > ampel.Hospitalisierung7Tage[0]
							? 1
							: data.Hospitalisierung7Tage > ampel.Hospitalisierung7Tage[1]
							? 2
							: 3;

					const IntensivbettenLevel =
						data.IntensivbettenProzent > ampel.IntensivbettenProzent[0]
							? 1
							: data.IntensivbettenProzent > ampel.IntensivbettenProzent[1]
							? 2
							: 3;

					let dayLevel = 1;

					for (let level = 1; level <= 3; level++) {
						let count = 0;
						if (InzidenzLevel >= level) count++;
						if (HospitalisierungLevel >= level) count++;
						if (IntensivbettenLevel >= level) count++;
						if (count >= 2) dayLevel = level;
					}

					temp.push(dayLevel);

					data.Warnstufe = temp.shift() || 1;
				}
			}
		}

		for (let districtName in this._data.data) {
			if (VersorgungsgebieteDistricts.includes(districtName as District)) {
				delete this._data.data[districtName as District];
			}
		}
	}
}