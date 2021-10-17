export type Route = APIRoute | StaticRoute;

import express from 'express';
import fs from 'fs';
import typescript from 'typescript';
import sass from 'node-sass';
import { Reader } from './sheetReader';
import { APIDistrict, District } from './definitions/districts';
import { APIDate } from './definitions/data';
import { config } from './definitions/config';
import { genSitemap } from './sitemap';
import { Analytics } from './analytics';
import { TokenGenerator } from './tokens';

interface APIRoute {
	path: string;
	type: 'API';
	method: 'get' | 'post' | 'put' | 'delete';
	handler: (req: express.Request, res: express.Response, reader: Router) => void;
	apilimit: number;
	groupsAllowed: string[];
}
interface StaticRoute {
	path: string;
	type: 'STATIC';
	folder: string;
	apilimit: number;
	listInSitemap: boolean;
	groupsAllowed: string[];
}

const routes: Route[] = [
	//---------------------
	// Static Routes
	//---------------------

	{
		path: '/',
		type: 'STATIC',
		folder: '/app/index',
		apilimit: 0,
		listInSitemap: true,
		groupsAllowed: ['all'],
	},
	{
		path: '/lk/:lk/',
		type: 'STATIC',
		folder: '/app/index',
		apilimit: 0,
		listInSitemap: true,
		groupsAllowed: ['all'],
	},
	{
		path: '/docs/',
		type: 'STATIC',
		folder: '/app/docs',
		apilimit: 0,
		listInSitemap: true,
		groupsAllowed: ['all'],
	},
	{
		path: '/26teCoronaVerordnung/',
		type: 'STATIC',
		folder: '/app/26teCoronaVerordnung',
		apilimit: 0,
		listInSitemap: true,
		groupsAllowed: ['all'],
	},
	{
		path: '/kontakt/',
		type: 'STATIC',
		folder: '/app/kontakt',
		apilimit: 0,
		listInSitemap: false,
		groupsAllowed: ['all'],
	},
	{
		path: '/iframe/',
		type: 'STATIC',
		folder: '/app/iframe',
		apilimit: 0,
		listInSitemap: false,
		groupsAllowed: ['all'],
	},

	//---------------------
	// API Routes
	//---------------------

	{
		path: '/api/v1/data',
		type: 'API',
		method: 'get',
		handler: (req, res, router) => {
			let { last, district } = req.query;

			let dataToSend: {
				Gebiet: APIDistrict;
				Inzidenz7Tage: number;
				Hospitalisierung7Tage: number;
				IntensivbettenProzent: number;
				Date: string;
				Warnstufe: number;
			}[] = [];

			for (const district of APIDistrict) {
				if (!router.reader.data?.data[district as District]) continue;

				const districtData = router.reader.data?.data[district as District];

				for (const date of Object.keys(districtData)) {
					const data = districtData[date as APIDate];

					dataToSend.push({
						Gebiet: district as APIDistrict,
						Inzidenz7Tage: data.Inzidenz7Tage,
						Hospitalisierung7Tage: data.Hospitalisierung7Tage,
						IntensivbettenProzent: data.IntensivbettenProzent,
						Date: new Date(
							Number.parseInt(date.split('.')[2]),
							Number.parseInt(date.split('.')[1]) - 1,
							Number.parseInt(date.split('.')[0])
						).toLocaleDateString(),
						Warnstufe: data.Warnstufe,
					});
				}
			}

			if (last) {
				dataToSend = dataToSend.filter(
					(d) =>
						Date.now() - Number.parseInt(last as string) * 24 * 60 * 60 * 1000 <
						new Date(d.Date).getTime()
				);
			}

			if (district) {
				dataToSend = dataToSend.filter((d) => d.Gebiet === (district as APIDistrict));
			}

			dataToSend.sort((a, b) => {
				return new Date(a.Date).getTime() - new Date(b.Date).getTime();
			});

			res.json({
				data: dataToSend,
				lastUpdate: undefined,
				github: router.reader.data?.github,
			});
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},
	{
		path: '/api/v1/districts',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			res.json(
				APIDistrict.sort((a, b) => {
					const aName = a.replace('KS ', '');
					const bName = b.replace('KS ', '');

					if (aName < bName) return -1;
					if (aName > bName) return 1;
					return 0;
				})
			);
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},
	{
		path: '/api/v2/data',
		type: 'API',
		method: 'get',
		handler: (req, res, router) => {
			res.json(router.reader.data);
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},
	{
		path: '/api/v2/districts',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			res.json(
				APIDistrict.sort((a, b) => {
					const aName = a.replace('KS ', '');
					const bName = b.replace('KS ', '');

					if (aName < bName) return -1;
					if (aName > bName) return 1;
					return 0;
				})
			);
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},

	//---------------------
	// Admin Routes
	//---------------------

	{
		path: '/admin/analytics',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			res.json(Analytics.getInstance().data);
		},
		apilimit: 30,
		groupsAllowed: ['admin'],
	},
	{
		path: '/admin/clearCache',
		type: 'API',
		method: 'get',
		handler: (req, res, router) => {
			router.clearCache();
			res.json({
				success: true,
			});
		},
		apilimit: 30,
		groupsAllowed: ['admin'],
	},

	//---------------------
	// Bot Routes
	//---------------------

	{
		path: '/robots.txt',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			res.send(fs.readFileSync('/app/app/robots.txt'));
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},
	{
		path: '/sitemap.xml',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			res.send(genSitemap(routes));
		},
		apilimit: 30,
		groupsAllowed: ['all'],
	},

	//---------------------
	// Generate Token
	//---------------------

	{
		path: '/generateToken',
		type: 'API',
		method: 'get',
		handler: (req, res) => {
			const token = TokenGenerator.getInstance().createToken(`${req.query.userId}`);
			res.json({
				token: token,
			});
		},
		apilimit: 6,
		groupsAllowed: ['all'],
	},
];

export class Router {
	private _router: express.Router;
	private _filecache: { [key: string]: string } = {};
	private _reader: Reader;

	constructor(reader: Reader) {
		this._router = express.Router();
		this._reader = reader;
		this.init();
	}

	public get router() {
		return this._router;
	}

	public get reader() {
		return this._reader;
	}

	public clearCache() {
		this._filecache = {};
	}

	private init() {
		routes.forEach((route) => {
			switch (route.type) {
				case 'API':
					this.api(route);
					break;
				case 'STATIC':
					this.static(route);
					break;
			}
		});
	}

	private static(route: StaticRoute) {
		this._router.get(route.path, (req: express.Request, res: express.Response) => {
			if (!this.checklimit(req, res, route)) return;
			if (!this._filecache[route.folder]) {
				const file = fs.readFileSync('/app' + route.folder + '/index.html').toString();
				this._filecache[route.folder] = file;
				setTimeout(() => {
					delete this._filecache[route.folder];
				}, 1000 * 60 * 60 * 24);
				res.header('from-server-cache', 'false').send(file);
			} else {
				res.header('from-server-cache', 'true').send(this._filecache[route.folder]);
			}
		});
		this._router.get(route.path + 'script.ts', (req: express.Request, res: express.Response) => {
			if (!this.checklimit(req, res, route)) return;
			if (!this._filecache[route.folder + '/script.ts']) {
				const file = fs.readFileSync('/app' + route.folder + '/script.ts').toString();
				const compiled = typescript.transpile(file, {
					module: typescript.ModuleKind.CommonJS,
					target: typescript.ScriptTarget.ES5,
				});
				this._filecache[route.folder + '/script.ts'] = compiled;
				setTimeout(() => {
					delete this._filecache[route.folder + '/script.ts'];
				}, 1000 * 60 * 60 * 24);
				res.type('text/javascript').header('from-server-cache', 'false').send(compiled);
			} else {
				res.type('text/javascript')
					.header('from-server-cache', 'true')
					.send(this._filecache[route.folder + '/script.ts']);
			}
		});
		this._router.get(route.path + 'style.scss', (req: express.Request, res: express.Response) => {
			if (!this.checklimit(req, res, route)) return;
			if (!this._filecache[route.folder + '/style.scss']) {
				const file = fs.readFileSync('/app' + route.folder + '/style.scss').toString();
				const compiled = sass.renderSync({
					data: file,
					outputStyle: 'compressed',
				});
				this._filecache[route.folder + '/style.scss'] = compiled.css.toString();
				setTimeout(() => {
					delete this._filecache[route.folder + '/style.scss'];
				}, 1000 * 60 * 60 * 24);
				res.type('text/css').header('from-server-cache', 'false').send(compiled.css.toString());
			} else {
				res.type('text/css')
					.header('from-server-cache', 'true')
					.send(this._filecache[route.folder + '/style.scss']);
			}
		});
	}

	private api(route: APIRoute) {
		this._router[route.method](route.path, (req: express.Request, res: express.Response) => {
			if (!this.checklimit(req, res, route)) return;
			route.handler(req, res, this);
		});
	}

	private _ipcache: {
		[route: string]: {
			[ip: string]: number;
		};
	} = {};
	private checklimit(req: express.Request, res: express.Response, route: StaticRoute | APIRoute) {
		const token =
			req.header('token')?.split(' ')[1] || req.header('authorization')?.split(' ')[1];
		const tokenData = TokenGenerator.getInstance().getPermissions(token);

		if (this._ipcache[route.path] === undefined) this._ipcache[route.path] = {};
		if (this._ipcache[route.path][req.ip] === undefined) this._ipcache[route.path][req.ip] = 0;
		if (
			this._ipcache[route.path][req.ip] >= route.apilimit &&
			route.apilimit > 0 &&
			!tokenData.permissions.some(
				(p) =>
					p.path === route.path &&
					p.limitMultiplicator &&
					(p.limitMultiplicator === 0 ||
						p.limitMultiplicator * route.apilimit > this._ipcache[route.path][req.ip])
			)
		) {
			res.status(429)
				.header('Retry-After', '60')
				.send('Too many requests. Please try again later.');
			return false;
		} else {
			if (!route.groupsAllowed.includes('all')) {
				if (!route.groupsAllowed.some((group) => tokenData.groups.some((g) => g === group))) {
					res.status(403).send('You are not allowed to access this resource.');
					return false;
				}
			}
			this._ipcache[route.path][req.ip]++;
			setTimeout(() => {
				this._ipcache[route.path][req.ip]--;
			}, 60 * 1000);
			return true;
		}
	}
}
