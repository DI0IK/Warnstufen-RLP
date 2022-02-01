import { Worksheet } from 'exceljs';

export default function parseDayTable(input: Worksheet, date: Date): DayTable {
	const districts: DayTable = {};
	if (!input) return;
	let startRow = 4;
	if (input.getRow(4).getCell('A').value.toString().includes('Kreis, Stand')) {
		startRow = 5;
	}
	if (new Date(Date.UTC(2022, 0, 17, 0, 0, 0)) < date) {
		console.log('Using new format');
		for (let rowNum = startRow; rowNum < input.rowCount + 1; rowNum++) {
			const row = input.getRow(rowNum);
			const districtName = String(row.getCell('A').value);
			const data: DistrictData = {
				seitBeginn: {
					Gesamt: Number(row.getCell('B').value),
					Diff: Number(row.getCell('C').value),
					Hospitalisierung: Number(row.getCell('D').value),
					Verstorben: Number(row.getCell('E').value),
					Genesen: Number(row.getCell('F').value.toString().replace('#', '').trim()),
					aktuelleFaelle: Number(row.getCell('G').value),
				},
				neueFaelle: {
					letzte7Tage: Number(row.getCell('H').value),
					vor7Tagenletzte7Tage: Number(row.getCell('I').value),
				},
				inzidenz: {
					RLP: Number(row.getCell('J').value),
					RLPundUSAF: Number(row.getCell('K').value),
					lt20y: Number(row.getCell('L').value),
					lt60y: Number(row.getCell('M').value),
					gt60y: Number(row.getCell('N').value),
					IntensivHospitalisierungRLP: Number(row.getCell('O').value),
				},
			};

			districts[districtName] = data;
		}
		return districts;
	} else {
		for (let rowNum = startRow; rowNum < input.rowCount + 1; rowNum++) {
			const row = input.getRow(rowNum);
			const districtName = String(row.getCell('A').value);
			const data: DistrictData = {
				seitBeginn: {
					Gesamt: Number(row.getCell('B').value),
					Diff: Number(row.getCell('C').value),
					Hospitalisierung: Number(row.getCell('D').value),
					Verstorben: Number(row.getCell('E').value),
					Genesen: Number(row.getCell('F').value.toString().replace('#', '').trim()),
					aktuelleFaelle: Number(row.getCell('G').value),
				},
				neueFaelle: {
					letzte7Tage: Number(row.getCell('H').value),
					vor7Tagenletzte7Tage: null,
				},
				inzidenz: {
					RLP: Number(row.getCell('I').value),
					RLPundUSAF: Number(row.getCell('J').value),
					lt20y: Number(row.getCell('K').value),
					lt60y: Number(row.getCell('L').value),
					gt60y: Number(row.getCell('M').value),
					IntensivHospitalisierungRLP:
						row.getCell('N').value !== districtName ? Number(row.getCell('N').value) : null,
				},
			};

			districts[districtName] = data;
		}
		return districts;
	}
}

export interface DayTable {
	[districtName: string]: DistrictData;
}

export interface DistrictData {
	seitBeginn: {
		Gesamt: number;
		Diff: number;
		Hospitalisierung: number;
		Verstorben: number;
		Genesen: number;
		aktuelleFaelle: number;
	};
	neueFaelle: {
		letzte7Tage: number;
		vor7Tagenletzte7Tage?: number;
	};
	inzidenz: {
		RLP: number;
		RLPundUSAF: number;
		lt20y: number;
		lt60y: number;
		gt60y: number;
		IntensivHospitalisierungRLP?: number;
	};
}
