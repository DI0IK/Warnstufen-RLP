import { getLkData } from '../../../lib/lk';
import { NextApiRequest, NextApiResponse } from 'next';
import { APIDistrict } from '../../../sheetReader/definitions/districts';
import { APIRawData } from '../../../sheetReader/definitions/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const lkName = (req.query.pid as string).replace(/_/g, ' ') as APIDistrict;
	const lkData = await getLkData(lkName);
	if (!lkData) return res.status(404).json({ error: 'District not found' });
	const todayDate = new Date().toLocaleDateString('de-DE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
	const yesterdayDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toLocaleDateString(
		'de-DE',
		{
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		}
	);
	const todayData = (lkData[todayDate] || lkData[yesterdayDate]) as APIRawData;

	if (!process.env.VERCEL_URL) {
		import('canvas').then((canvas) => {
			if (!todayData) {
				const c = canvas.createCanvas(1200, 600);
				const ctx = c.getContext('2d');
				// Gray Background
				ctx.fillStyle = '#fafafa';
				ctx.fillRect(0, 0, 1200, 600);
				// Text saying no data for today
				ctx.fillStyle = '#000';
				ctx.font = 'bold 48px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText('Keine Daten für heute', 600, 300);

				res.setHeader('Content-Type', 'image/png');
				res.setHeader('Cache-Control', 'public, max-age=86400');
				res.setHeader('Expires', new Date(Date.now() + 1000).toUTCString());
				res.statusCode = 200;
				res.end(c.toBuffer('image/png'));
			} else {
				const c = canvas.createCanvas(1200, 600);
				const ctx = c.getContext('2d');

				// Warnstufe 1 = yellow; Warnstufe 2 = orange; Warnstufe 3 = red
				ctx.fillStyle =
					'#' +
					(todayData.Warnstufe === 1
						? 'e6e600'
						: todayData.Warnstufe === 2
						? 'ffa500'
						: 'ff0000');
				ctx.fillRect(0, 0, 1200, 600);

				ctx.fillStyle = '#000';
				ctx.font = 'bold 56px Arial' as any;
				ctx.fillText(lkName.replace('KS', 'Kreisstadt'), 50, 100);

				ctx.font = 'bold 38px Arial' as any;
				ctx.fillText('Warnstufe: ' + todayData.Warnstufe, 50, 200);
				ctx.fillText('7 Tage Inzidenz pro 100.000: ' + todayData.Inzidenz7Tage, 50, 250);
				ctx.fillText(
					'7 Tage Hospitalisierungsinzidenz pro 100.000: ' + todayData.Hospitalisierung7Tage,
					50,
					300
				);
				ctx.fillText(
					'Intensivbetten belegt: ' + todayData.IntensivbettenProzent + '%',
					50,
					350
				);

				// Footer with date

				ctx.fillStyle = '#000';
				ctx.font = 'bold 22px Arial' as any;
				ctx.fillText(todayDate, 50, 550);

				// Genearate an image with the data, expires tomorrow
				res.setHeader('Content-Type', 'image/png');
				res.setHeader('Cache-Control', 'public, max-age=86400');
				res.setHeader('Expires', new Date(Date.now() + 86400 * 1000).toUTCString());
				res.statusCode = 200;
				res.end(c.toBuffer('image/png'));
			}
		});
	} else {
		res.statusCode = 400;
		res.end('Not available in Vercel build');
	}
}
