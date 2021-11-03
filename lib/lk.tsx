import { APIDistrict } from '../sheetReader/definitions/districts';
import { Reader } from '../sheetReader/sheetReader';

export function getAllLk() {
	return [
		...APIDistrict.map((d) => {
			return {
				params: {
					id: d,
				},
			};
		}),
	];
}

export async function getLkData(id?: APIDistrict) {
	const reader = Reader.getInstance(10 * 60 * 1000, () => {});

	return new Promise<any>((resolve, reject) => {
		const timer = setInterval(() => {
			if (reader.data && id) {
				clearInterval(timer);
				const lk = APIDistrict.find((d) => {
					return d === id;
				});
				resolve(reader.data.v2.data[lk]);
			} else if (reader.data) {
				clearInterval(timer);
				resolve(reader.data.v2.data);
			}
		}, 100);
	});
}
