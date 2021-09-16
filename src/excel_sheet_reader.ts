import exceljs from 'exceljs';
import axios from 'axios';
import { Config, Data } from './formats';
const config = require('../config.json') as Config;

export function read(link: string): Promise<exceljs.Workbook> {
	return new Promise((resolve, reject) => {
		axios
			.get(link, {
				responseType: 'arraybuffer',
			})
			.then((response) => {
				const buffer = response.data;
				const workbook = new exceljs.Workbook();
				workbook.xlsx.load(buffer).then(() => {
					resolve(workbook);
				});
			})
			.catch((error) => {
				reject(error);
			});
	});
}

export async function getDataOfCovidSheet(): Promise<Data[]> {
	let data: Data[] = [];
	const workbook = await read(config.excel_sheet.url);
	const worksheet = workbook.getWorksheet(config.excel_sheet.sheet);
	worksheet.eachRow((row, rowNumber) => {
		let district = row.getCell(1).value;
		if (typeof district !== 'string') {
			district = (district as exceljs.CellRichTextValue).richText[0].text.replace('\n', ' ');
		}
		if (rowNumber >= config.excel_sheet.start_row && rowNumber <= config.excel_sheet.end_row) {
			row.eachCell((cell, colNumber) => {
				if ((district as string).includes('Versorgungsgebiet')) {
					if ((colNumber + 1) % 3 === 1) {
						data.push({
							Gebiet: district as string,
							Inzidenz7Tage: row.getCell(colNumber - 1).value as number,
							Hospitalisierung7Tage: row.getCell(colNumber).value as number,
							IntensivbettenProzent: row.getCell(colNumber + 1).value as number,
							Date: DateFromString(worksheet.getRow(1).getCell(colNumber).value),
						});
					}
				} else {
					if ((colNumber + 1) % 3 === 0) {
						data.push({
							Gebiet: district as string,
							Inzidenz7Tage: row.getCell(colNumber).value as number,
							Hospitalisierung7Tage: row.getCell(colNumber + 1).value as number,
							IntensivbettenProzent: row.getCell(colNumber + 2).value as number,
							Date: DateFromString(worksheet.getRow(1).getCell(colNumber).value),
						});
					}
				}
			});
		}
	});
	return data;
}

function DateFromString(date: string | any): string {
	const datePart = date.split(',')[1].split('.');
	const parsedDate = new Date(
		Number.parseInt(datePart[2]),
		Number.parseInt(datePart[1]) - 1,
		Number.parseInt(datePart[0])
	);
	return parsedDate.toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
}
