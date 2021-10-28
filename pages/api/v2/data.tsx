import { NextApiRequest, NextApiResponse } from 'next';
import { Reader } from '../../../sheetReader/sheetReader';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const reader = Reader.getInstance(10 * 60 * 1000, () => {});
	new Promise<any>((resolve, reject) => {
		const timer = setInterval(() => {
			if (reader.data) {
				clearInterval(timer);
				resolve(reader.data);
				res.status(200).json(reader.data.v2);
			}
		}, 100);
	});
}
