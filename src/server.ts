import express from 'express';
import useragent from 'express-useragent';

import { getDataOfCovidSheet } from './excel_sheet_reader';
import { Data, Config } from './formats';

import * as districts from './districts';
const config = require('../config.json') as Config;

import http from 'http';
import https from 'https';

import fs from 'fs';

import path from 'path';

const app = express();

app.use(useragent.express());

let cachedData: {
	data: Data[];
	lastUpdated: number;
} | null = null;

let clickCount = 0;

let apiLimits: {
	[ip: string]: Date[];
} = {};

const httpsServer = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.key')),
		cert: fs.readFileSync(path.join(__dirname, '..', 'sslcert/server.cer')),
	},
	app
);
const httpServer = http.createServer(app);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'web', 'dashboard', 'index.html'));
	clickCount++;
	saveData();
});

app.get('/web/:folder/:filename?', (req, res) => {
	res.sendFile(
		path.join(
			__dirname,
			'..',
			'web',
			`${req.params.folder}`,
			`${req.params.filename || 'index.html'}`
		)
	);
});

app.get('/api/v1/data', (req, res) => {
	const cDate = new Date();
	const request = apiLimits[req.ip]?.filter((x) => x.getTime() > Date.now() - 1000 * 60);
	if (request && request.length >= config.api.limit) {
		const lastDate = request.sort((a, b) => a.getTime() - b.getTime())[0];
		let untilDate = new Date(lastDate.getTime() + 1000 * 60);
		res.status(429).json({
			error: 'Too many requests',
			limit: config.api.limit,
			blockedUntil: untilDate.toUTCString(),
		});
		return;
	}
	const district = req.query?.district;
	const last = Number.parseInt(req.query?.last as string);

	let data = cachedData?.data;
	if (!data) return res.status(500).send('No data available');
	if (district) {
		data = data.filter((d: Data) => d.Gebiet === district);
	}
	if (last) {
		const lastDate = new Date(new Date().getTime() - last * 24 * 60 * 60 * 1000);
		data = data.filter((d: Data) => new Date(d.Date).getTime() > lastDate.getTime());
	}
	res.json({
		data: WarnstufenFix(data.map((d: Data) => getWarnstufe(d))),
		lastUpdated: cachedData?.lastUpdated,
		github: 'https://github.com/DI0IK/Warnstufen-RLP',
	});
	if (!apiLimits[req.ip]) apiLimits[req.ip] = [];
	apiLimits[req.ip].push(new Date());
});

app.get('/api/v1/districts', (req, res) => {
	res.json(
		districts.districts
			.filter((x) => !x.includes('Versorgungsgebiet'))
			.sort((a, b) => {
				const a_n = a.replace('KS ', '');
				const b_n = b.replace('KS ', '');
				if (a_n > b_n) return 1;
				if (a_n < b_n) return -1;
				return 0;
			})
	);
});

app.get('/api/v1/clicks', (req, res) => {
	res.json({
		count: clickCount,
	});
});

async function getData() {
	const data = await getDataOfCovidSheet();
	cachedData = {
		data: data,
		lastUpdated: new Date().getTime(),
	};
}

getData();
setInterval(getData, 1000 * 60 * 30);

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

// Start http/s server:

httpsServer.listen(config.api.httpsPort, () => {
	console.log('https server listening on port', config.api.httpsPort);
});
httpServer.listen(config.api.httpPort, () => {
	console.log('http server listening on port', config.api.httpPort);
});

function loadData() {
	try {
		let clicks_string = fs.readFileSync(path.join(__dirname, '..', 'data', 'clicks.txt'));
		if (clicks_string) clickCount = Number.parseInt(clicks_string.toString());
	} catch (error) {}
}

function saveData() {
	fs.writeFileSync(path.join(__dirname, '..', 'data', 'clicks.txt'), clickCount.toString());
}

loadData();
