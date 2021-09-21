import { getDataOfCovidSheet } from './excel_sheet_reader';
import { Config, Data } from './formats';
import * as districts from './districts';
const config = require('../config.json') as Config;

//------------------------
// Cache Data every 20min
//------------------------

let cachedData: {
	data: Data[];
};

async function readDataLoop() {
	const data = await getDataOfCovidSheet();
	cachedData = { data };
	updateCache({ data: WarnstufenFix(data.map(getWarnstufe)), lastSync: new Date() });
}

readDataLoop();
setInterval(readDataLoop, 1000 * 60 * 20);

function getWarnstufe(data: Data) {
	let level = 1;
	let levels = [];

	const Versorgungsgebiet = districts.Versorgungsgebiet.filter((x: any) => {
		return x.districts.includes(data.Gebiet) || x.name === data.Gebiet;
	});
	const VersorgungsgebietHospitalisierung = cachedData?.data.filter((x: any) => {
		return x.Gebiet === Versorgungsgebiet[0].name && x.Date === data.Date;
	})[0]?.Hospitalisierung7Tage;
	data.Hospitalisierung7Tage = VersorgungsgebietHospitalisierung as number;

	const RPLIntensivBettenProzent = cachedData?.data.filter((x: any) => {
		return x.Gebiet === 'Rheinland-Pfalz' && x.Date === data.Date;
	})[0]?.IntensivbettenProzent;
	data.IntensivbettenProzent = RPLIntensivBettenProzent as number;

	for (let levelNum of [1, 2, 3]) {
		for (let i of ['Inzidenz7Tage', 'Hospitalisierung7Tage', 'IntensivbettenProzent']) {
			if ((data as any)[i] > (config.ampel as any)[i][levelNum - 1]) {
				levels.push(levelNum);
			}
		}
	}

	if (levels.filter((x) => x >= 2).length > config.ampel.needed) level = 2;
	if (levels.filter((x) => x >= 3).length > config.ampel.needed) level = 3;

	data.Warnstufe = level;

	return data;
}

function WarnstufenFix(data: Data[]) {
	data.sort((a, b) => {
		if (a.Date > b.Date) return 1;
		if (a.Date < b.Date) return -1;
		return 0;
	});

	let currentWarnstufe = 1;
	let newWarnstufe = 1;
	let sameWarnstufeCount = 0;
	let history: number[] = [1, 1];

	for (let dataPart of data) {
		if (dataPart.Warnstufe === currentWarnstufe) {
			sameWarnstufeCount++;
		} else {
			currentWarnstufe = dataPart.Warnstufe as number;
			sameWarnstufeCount = 1;
		}
		if (sameWarnstufeCount >= 3) {
			newWarnstufe = currentWarnstufe;
		}
		history.push(newWarnstufe);
		dataPart.Warnstufe = history.shift();
	}

	return data.sort((a, b) => {
		return new Date(b.Date).getTime() - new Date(a.Date).getTime();
	});
}

//------------------------
// Initialize Express App
//------------------------

import express from 'express';
import useragent from 'express-useragent';

const app = express();

app.use(useragent.express());

import http from 'http';
import https from 'https';
import fs from 'fs';

const httpServer = http.createServer(app);
const httpsServer = https.createServer(
	{
		key: fs.readFileSync('./sslcert/server.key'),
		cert: fs.readFileSync('./sslcert/server.cer'),
	},
	app
);

httpServer.listen(config.api.httpPort, () => {
	console.log(`HTTP Server listening on port ${config.api.httpPort}`);
});
httpsServer.listen(config.api.httpsPort, () => {
	console.log(`HTTPS Server listening on port ${config.api.httpsPort}`);
});

//------------------------
// Setup Routes
//------------------------

import { setupRouter, updateCache } from './routes';

setupRouter(app);
