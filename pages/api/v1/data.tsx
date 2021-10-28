import { NextApiRequest, NextApiResponse } from 'next';
import { Reader } from '../../../sheetReader/sheetReader';
import { APIDistrict } from "./../../sheetReader/definitions/data"

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const reader = Reader.getInstance(10 * 60 * 1000, () => {});
	new Promise<any>((resolve, reject) => {
		const timer = setInterval(() => {
			if (reader.data) {
				clearInterval(timer);
				resolve(reader.data);
				const { last, district } = req.query;
				let data = reader.data.v1;

				if (last) {
					data = data.filter(
						(d) =>
							Date.now() - Number.parseInt(last as string) * 24 * 60 * 60 * 1000 <
							new Date(d.Date).getTime()
					);
				}
	
				if (district) {
					data = data.filter((d) => d.Gebiet === (district as APIDistrict));
				}

				res.status(200).json(data);
			}
		}, 100);
	});
}
