import { Worksheet } from 'exceljs';

export default function parseDayTable(input: Worksheet): DayTable {
	const districts: DayTable = {};
	for (let rowNum = 4; rowNum < input.rowCount; rowNum++) {
		const row = input.getRow(rowNum);
		const districtName = String(row.getCell('A').value);
		const data: DistrictData = {
			seitBeginn: {
				Gesamt: Number(row.getCell('B').value),
				Diff: Number(row.getCell('C').value),
				Hospitalisierung: Number(row.getCell('D').value),
				Verstorben: Number(row.getCell('E').value),
				Genesen: Number(row.getCell('F').value),
				aktuelleFaelle: Number(row.getCell('G').value),
			},
			siebenTage: {
				Gesamt: Number(row.getCell('H').value),
				Inzidenz: {
					RLP: Number(row.getCell('I').value),
					RLPundUSAF: Number(row.getCell('J').value),
					lt20y: Number(row.getCell('K').value),
					lt60y: Number(row.getCell('L').value),
					gt60y: Number(row.getCell('M').value),
				},
				IntensivHospitalisierungRLP:
					row.getCell('N').value !== districtName ? Number(row.getCell('N').value) : undefined,
			},
		};

		districts[districtName] = data;
	}
	return districts;
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
	siebenTage: {
		Gesamt: number;
		Inzidenz: {
			RLP: number;
			RLPundUSAF: number;
			lt20y: number;
			lt60y: number;
			gt60y: number;
		};
		IntensivHospitalisierungRLP?: number;
	};
}
