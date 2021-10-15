import express from 'express';
import { Details } from 'express-useragent';
import fs from 'fs';
import { APIEndpoint, Config, Data, Route } from './formats';
import sass from 'node-sass';
import ts from 'typescript';
import { districts } from './districts';
import axios from 'axios';
import { Logger } from './logger';
import { genSiteMap } from './sitemap';
const config = require('../config.json') as Config;

const logger = new Logger({
	log: false,
	logFiles: { access: './logs/access.log', log: './logs/log.log' },
});

//------------------------
// Web routes
//------------------------

let router: express.Router = express.Router();

export function setupRouter(app: express.Application) {
	app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
		if (!req.secure) {
			res.redirect(`https://${req.headers.host}${req.url}`);
			return;
		}
		if (!req.subdomains[0]) {
			res.redirect(`https://www.${req.headers.host}${req.url}`);
			return;
		}
		router(req, res, next);
	});
	setRoutes();
}

let ipGeoCache: {
	[ip: string]: any;
} = {};

function setRoutes() {
	router = express.Router();
	for (let route of Routes) {
		router.get(route.path, (req: express.Request, res: express.Response) => {
			if (route.loginRequired) {
				if (req.cookies.token !== 'Bearer ' + config.api.token)
					return res.redirect('/login?path=' + req.url);
			}
			if (!route.pageCalls) route.pageCalls = [];
			getGeoInfos(req.ip).then((geo) => {
				route.pageCalls?.push({
					ip: req.ip,
					time: Date.now(),
					userAgent: {
						isBot: req.useragent?.isBot,
						isMobile: req.useragent?.isMobile,
						isDesktop: req.useragent?.isDesktop,
						browser: req.useragent?.browser,
						os: req.useragent?.os,
						useragent: req.useragent?.source,
						geoIp: geo,
						referer: req.headers.referer || req.headers.referrer || 'none',
					},
				});
				logger.propertyAccess(req.ip, req.url, {
					userAgent: req.useragent?.source,
					geoIp: geo,
					headers: req.headers,
					referer: req.headers.referer || req.headers.referrer || 'none',
				});
			});
			res.send(getHTML(route, req));
		});
	}
	for (let endpoint of APIEndpoints) {
		(router as any)[endpoint.method.toLowerCase()](
			endpoint.path,
			(req: express.Request, res: express.Response) => {
				if (
					endpoint.authRequired &&
					req.headers.authorization !== 'Bearer ' + config.api.token &&
					req.cookies.token !== 'Bearer ' + config.api.token
				)
					return res.sendStatus(401);
				if (!endpoint.apiCalls) endpoint.apiCalls = [];
				if (endpoint.apiLimit) {
					if (
						endpoint.apiCalls.filter(
							(item) => item.ip == req.ip && item.time > new Date().getTime() - 1000 * 60
						).length < endpoint.apiLimit
					) {
						endpoint.handler(req, res);
						getGeoInfos(req.ip).then((geo) => {
							endpoint.apiCalls?.push({
								ip: req.ip,
								time: new Date().getTime(),
								userAgent: {
									geoIp: geo,
								},
							});
							logger.propertyAccess(req.ip, req.url, {
								geoIp: geo,
								headers: req.headers,
							});
						});
					} else {
						res.sendStatus(429);
					}
				} else {
					endpoint.handler(req, res);
					getGeoInfos(req.ip).then((geo) => {
						endpoint.apiCalls?.push({
							ip: req.ip,
							time: new Date().getTime(),
							userAgent: {
								geoIp: geo,
							},
						});
						logger.propertyAccess(req.ip, req.url, {
							geoIp: geo,
							headers: req.headers,
						});
					});
				}
			}
		);
	}
}

let Routes: Route[] = JSON.parse(fs.readFileSync('./app/routes.json').toString()) as Route[];

function getHTML(route: Route, req: express.Request) {
	let defaultHTML = fs.readFileSync('./app/default.html').toString();
	const { isMobile, isDesktop } = req.useragent as Details;

	if (route.page.replaceWholePage && route.page.replaceWholePage.length > 0) {
		let page = '';
		for (let replaceWholePage of route.page.replaceWholePage) {
			if (
				replaceWholePage.type === 'both' ||
				(replaceWholePage.type === 'mobile' && isMobile) ||
				(replaceWholePage.type === 'desktop' && isDesktop)
			) {
				page = fs
					.readFileSync(`./app/${route.folderName}/${replaceWholePage.fileName}`)
					.toString();
				break;
			}
		}
		if (page) return page;
	}

	if (route.page.htmlFileName.length === 0) {
		return defaultHTML;
	}

	for (let htmlFile of route.page.htmlFileName) {
		if (
			htmlFile.type === 'both' ||
			(htmlFile.type === 'mobile' && isMobile) ||
			(htmlFile.type === 'desktop' && isDesktop)
		) {
			defaultHTML = defaultHTML.replace(
				'%%BODY%%',
				fs.readFileSync(`./app/${route.folderName}/${htmlFile.fileName}`).toString()
			);
		}
	}

	let cssFiles = [];
	for (let cssFile of route.page.cssFileNames) {
		if (
			cssFile.type === 'both' ||
			(cssFile.type === 'mobile' && isMobile) ||
			(cssFile.type === 'desktop' && isDesktop)
		) {
			if (!cssFile.fileName.endsWith('.scss')) {
				cssFiles.push(
					fs.readFileSync(`./app/${route.folderName}/${cssFile.fileName}`).toString()
				);
			} else {
				cssFiles.push(
					sass
						.renderSync({
							file: `./app/${route.folderName}/${cssFile.fileName}`,
						})
						.css.toString()
				);
			}
		}
	}
	defaultHTML = defaultHTML.replace(
		'%%STYLES%%',
		cssFiles.map((file) => `<style>${file}</style>`).join('\n')
	);

	let jsFiles = [];
	for (let jsFile of route.page.jsFileNames) {
		if (
			jsFile.type === 'both' ||
			(jsFile.type === 'mobile' && isMobile) ||
			(jsFile.type === 'desktop' && isDesktop)
		) {
			if (jsFile.fileName.endsWith('.ts')) {
				jsFiles.push(
					ts.transpileModule(
						fs.readFileSync(`./app/${route.folderName}/${jsFile.fileName}`).toString(),
						{
							compilerOptions: {
								target: ts.ScriptTarget.ES5,
								module: ts.ModuleKind.CommonJS,
							},
						}
					).outputText
				);
			} else {
				jsFiles.push(
					fs.readFileSync(`./app/${route.folderName}/${jsFile.fileName}`).toString()
				);
			}
		}
	}
	defaultHTML = defaultHTML.replace(
		'%%SCRIPTS%%',
		jsFiles.map((file) => `<script>${file}</script>`).join('\n')
	);

	for (let title of route.page.titles) {
		if (
			title.type === 'both' ||
			(title.type === 'mobile' && isMobile) ||
			(title.type === 'desktop' && isDesktop)
		) {
			defaultHTML = defaultHTML.replace('%%PAGENAME%%', title.title);
		}
	}

	return defaultHTML;
}

//------------------------
// API routes
//------------------------

const APIEndpoints: APIEndpoint[] = [
	//----------------
	// Data Routes
	//----------------
	{
		path: '/api/v1/data',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			const { district, last } = req.query;

			let data = cache.data;

			if (last)
				data = data.filter(
					(item) =>
						new Date(item.Date).getTime() >
						new Date().getTime() - 1000 * 60 * 60 * 24 * Number.parseInt(last as string)
				);

			if (district) data = data.filter((item) => item.Gebiet === district);

			res.json({
				data,
				lastUpdate: cache.lastSync,
				github: 'https://github.com/DI0IK/Warnstufen-RLP',
			});
		},
		apiLimit: 30,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
	{
		path: '/api/v1/districts',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.json(
				districts
					.filter((district) => !district.includes('Versorgungsgebiet'))
					.sort((a, b) => {
						const a_n = a.replace('KS ', '');
						const b_n = b.replace('KS ', '');

						if (a_n < b_n) return -1;
						if (a_n > b_n) return 1;
						return 0;
					})
			);
		},
		apiLimit: 30,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},

	//----------------
	// Redirects
	//----------------
	{
		path: '/web/:a1/',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.redirect(301, `/${req.params.a1}`);
		},
		apiLimit: 30,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},

	//----------------
	// Admin routes
	//----------------
	{
		path: '/api/v1/admin/analytics',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.json({
				api: APIEndpoints.map((endpoint) => {
					return {
						path: endpoint.path,
						method: endpoint.method,
						apiLimit: endpoint.apiLimit,
						apiCalls: endpoint.apiCalls,
					};
				}),
				pages: Routes.map((route) => {
					return {
						path: route.path,
						apiCalls: route.pageCalls,
					};
				}),
			});
		},
		apiLimit: 30,
		authRequired: true,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
	{
		path: '/api/v1/admin/routes',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.json(Routes);
		},
		apiLimit: 30,
		authRequired: true,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
	{
		path: '/api/v1/admin/reloadRoutes',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			try {
				Routes = JSON.parse(fs.readFileSync('./app/routes.json').toString());
				setRoutes();
				res.json({
					success: true,
				});
			} catch (error) {
				res.json({
					success: false,
					error,
				});
			}
		},
		apiLimit: 30,
		authRequired: true,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
	{
		path: '/api/v1/admin/logs',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			// Read tab separated log file
			const logFile = fs.readFileSync('./logs/access.log').toString();
			const logLines = logFile.split('\n');

			// Parse log lines
			const logEntries = logLines
				.map((line) => {
					const [time, ip, path, data] = line.split('\t');
					if (!time || !ip || !path || !data) return;
					return {
						time,
						ip,
						path,
						data: JSON.parse(data),
					};
				})
				.filter((entry) => entry);

			// Sort log entries by time
			logEntries.sort((a, b) => {
				if (!a || !b) return 0;
				const a_time = new Date(a.time).getTime();
				const b_time = new Date(b.time).getTime();

				if (a_time < b_time) return -1;
				if (a_time > b_time) return 1;
				return 0;
			});

			res.json(logEntries);
		},
		apiLimit: 30,
		authRequired: true,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},

	//----------------
	// GoogleBot routes
	//----------------
	{
		path: '/robots.txt',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.send(fs.readFileSync('./app/robots.txt').toString());
		},
		apiLimit: 30,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
	{
		path: '/sitemap.xml',
		method: 'GET',
		handler: (req: express.Request, res: express.Response) => {
			res.send(genSiteMap(APIEndpoints, Routes));
		},
		apiLimit: 30,
		sitemap: {
			listed: false,
			changeFreq: 'daily',
			priority: 0.5,
		},
	},
];

//------------------------
// Update cache
//------------------------

let cache: {
	data: Data[];
	lastSync: Date;
} = undefined as any;

export function updateCache(data: { data: Data[]; lastSync: Date }) {
	cache = data;
}

//------------------------
// IP Geo Information
//------------------------

function getGeoInfos(ip: string) {
	return new Promise<any>((resolve, reject) => {
		if (!ipGeoCache[ip]) {
			axios
				.get(`http://ip-api.com/json/${ip.replace('::ffff:', '')}?fields=196313`, {
					responseType: 'json',
				})
				.then((response) => {
					resolve(response.data);
					ipGeoCache[ip] = response.data;
					setTimeout(() => {
						delete ipGeoCache[ip];
					}, 1000 * 60 * 60 * 6);
				})
				.catch((error) => {
					resolve(error);
				});
		} else {
			resolve(ipGeoCache[ip]);
		}
	});
}
