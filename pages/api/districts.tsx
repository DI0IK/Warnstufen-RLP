import { NextApiRequest, NextApiResponse } from 'next';
import DataFetcher from '../../data/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	res.statusCode = 200;
	const data = await new Promise<DataFetcher>((resolve, reject) => {
		const data = DataFetcher.getInstance();

		const interv = setInterval(() => {
			if (data.isReady) {
				clearInterval(interv);
				resolve(data);
			}
		}, 100);
	});

	res.json(data.getDistricts());
}
