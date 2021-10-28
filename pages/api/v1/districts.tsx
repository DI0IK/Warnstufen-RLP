// Districts API Route

import { NextApiRequest, NextApiResponse } from 'next';
import { APIDistrict } from '../../sheetReader/definitions/districts';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	res.status(200).json(APIDistrict);
}
