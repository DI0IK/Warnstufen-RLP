import axios from 'axios';
import excel, { Worksheet } from 'exceljs';
import fs from 'fs';

export default async function getSheet(url: string, sheetName: string): Promise<Worksheet> {
	let sheet: Worksheet;
	if (!fs.existsSync('cache/' + url.split('/').pop())) {
		try {
			const data = await axios.get(url, {
				responseType: 'arraybuffer',
			});
			fs.writeFileSync('cache/' + url.split('/').pop(), data.data);
		} catch (error) {
			console.log(`Failed to download ${url}`);
		}
	}
	const data = fs.readFileSync('cache/' + url.split('/').pop());
	if (!data) throw new Error('No data');
	const workbook = new excel.Workbook();
	await workbook.xlsx.load(data);
	sheet = workbook.getWorksheet(sheetName);
	return sheet;
}
