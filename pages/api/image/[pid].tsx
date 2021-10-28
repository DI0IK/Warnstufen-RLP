import { getLkData } from '../../../lib/lk';
import { NextApiRequest, NextApiResponse } from 'next';
import { APIDistrict } from '../../../sheetReader/definitions/districts';
import canvas from 'canvas';
import { APIRawData } from '../../../sheetReader/definitions/data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const lkName = (req.query.pid as string).replace(/_/g, ' ') as APIDistrict;
	const lkData = await getLkData(lkName);
	const todayDate = new Date().toLocaleDateString('de-DE');
	const todayData = lkData[todayDate] as APIRawData;

	// Genearate an image with the data, expires tomorrow
	res.setHeader('Content-Type', 'image/png');
	res.setHeader('Cache-Control', 'public, max-age=86400');
	res.setHeader('Expires', new Date(Date.now() + 86400 * 1000).toUTCString());

	const c = canvas.createCanvas(1200, 600);
	const ctx = c.getContext('2d');

	// Warnstufe 1 = yellow; Warnstufe 2 = orange; Warnstufe 3 = red
	ctx.fillStyle =
		'#' +
		(todayData.Warnstufe === 1 ? 'e6e600' : todayData.Warnstufe === 2 ? 'ffa500' : 'ff0000');
	ctx.fillRect(0, 0, 1200, 600);

	ctx.fillStyle = '#000';
	ctx.font = 'bold 60px Arial';
	ctx.fillText(lkName.replace('KS', 'Kreisstadt'), 50, 100);

	ctx.font = 'bold 40px Arial';
	ctx.fillText('Warnstufe: ' + todayData.Warnstufe, 50, 200);
	ctx.fillText('7 Tage Inzidenz pro 100.000: ' + todayData.Inzidenz7Tage, 50, 250);
	ctx.fillText(
		'7 Tage Hospitalisierungsinzidenz pro 100.000: ' + todayData.Hospitalisierung7Tage,
		50,
		300
	);
	ctx.fillText('Intensivbetten belegt: ' + todayData.IntensivbettenProzent + '%', 50, 350);

	// Footer with date

	ctx.fillStyle = '#000';
	ctx.font = 'bold 20px Arial';
	ctx.fillText(new Date().toLocaleDateString('de-DE'), 50, 550);

	res.statusCode = 200;
	res.end(c.toBuffer());
}
