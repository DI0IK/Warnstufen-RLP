const https = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');
const crypto = require('crypto');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const fs = require('fs');

const onVercel = process.env.VERCEL_URL !== undefined;

let bannedIPs = undefined;
let autoBanPaths = undefined;
let autoBanPathsRepetitions = {};

if (!onVercel) {
	app.prepare().then(() => {
		https
			.createServer(
				{
					key: fs.readFileSync('./certs/server.key'),
					cert:
						fs.readFileSync('./certs/server.crt') +
						fs.readFileSync('./certs/intermediate.crt'),
				},
				async (req, res) => {
					const parsedUrl = parse(req.url, true);

					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader(
						'Access-Control-Allow-Methods',
						'GET, POST, OPTIONS, PUT, PATCH, DELETE'
					);
					res.setHeader(
						'Access-Control-Allow-Headers',
						'X-Requested-With,content-type,content-length'
					);
					res.setHeader('Access-Control-Allow-Credentials', true);

					if (bannedIPs === undefined) {
						bannedIPs = fs.readFileSync('./bannedIPs.txt', 'utf8').split('\n');
					}
					if (autoBanPaths === undefined) {
						autoBanPaths = fs.readFileSync('./bannedPaths.txt', 'utf8').split('\n');
					}

					if (bannedIPs.includes(req.socket.remoteAddress.replace('::ffff:', ''))) {
						res.statusCode = 403;
						res.end(
							'Forbidden. If you are not a bot, please contact the server owner at "mail [at] warnzahl-rlp.de" and tell them your IP address.'
						);
						return log(req, res, Date.now(), 'https', true);
					}

					if (autoBanPaths.includes(parsedUrl.pathname)) {
						if (!autoBanPathsRepetitions[req.socket.remoteAddress.replace('::ffff:', '')])
							autoBanPathsRepetitions[req.socket.remoteAddress.replace('::ffff:', '')] = 0;

						autoBanPathsRepetitions[req.socket.remoteAddress.replace('::ffff:', '')]++;

						if (
							autoBanPathsRepetitions[req.socket.remoteAddress.replace('::ffff:', '')] > 5
						) {
							bannedIPs.push(req.socket.remoteAddress.replace('::ffff:', ''));
							fs.writeFileSync('./bannedIPs.txt', bannedIPs.join('\n'));
							delete autoBanPathsRepetitions[
								req.socket.remoteAddress.replace('::ffff:', '')
							];
						}

						res.statusCode = 200;
						res.end('OK');
						return log(
							req,
							res,
							Date.now(),
							'https',
							autoBanPathsRepetitions[req.socket.remoteAddress.replace('::ffff:', '')]
						);
					}

					const startTime = Date.now();

					// Access Logs
					if (parsedUrl.pathname.startsWith('/admin/data.tsv')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							const { date } = parsedUrl.query;
							try {
								const data = fs.readFileSync(
									`./logs/${date || new Date().toISOString().split('T')[0]}.tsv`
								);
								res.writeHead(200, {
									'Content-Type': 'text/tab-separated-values',
									'Content-Length': data.length,
								});
								res.end(data);
								return;
							} catch (err) {
								res.statusCode = 404;
								res.end('No data found');
								return;
							}
						}
					}

					// IP bans
					if (parsedUrl.pathname.startsWith('/admin/ban/add')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							const { ip } = parsedUrl.query;
							try {
								if (!bannedIPs.includes(ip)) {
									bannedIPs.push(ip);
									fs.writeFileSync(
										'./bannedIPs.txt',
										bannedIPs.filter((x) => x).join('\n')
									);
								}
								res.statusCode = 200;
								res.end('Success');
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}
					if (parsedUrl.pathname.startsWith('/admin/ban/remove')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							const { ip } = parsedUrl.query;
							try {
								const newBannedIPs = bannedIPs.filter((x) => x !== ip);
								bannedIPs = newBannedIPs;
								fs.writeFileSync('./bannedIPs.txt', bannedIPs.join('\n'));
								res.statusCode = 200;
								res.end('Success');
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}
					if (parsedUrl.pathname.startsWith('/admin/ban/list')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							try {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify(bannedIPs));
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}

					// Auto-ban
					if (parsedUrl.pathname.startsWith('/admin/autoban/add')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							const { path } = parsedUrl.query;
							try {
								if (!autoBanPaths.includes(path)) {
									autoBanPaths.push(path);
									fs.writeFileSync(
										'./bannedPaths.txt',
										autoBanPaths.filter((x) => x).join('\n')
									);
								}
								res.statusCode = 200;
								res.end('Success');
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}
					if (parsedUrl.pathname.startsWith('/admin/autoban/remove')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							const { path } = parsedUrl.query;
							try {
								const newAutoBanPaths = autoBanPaths.filter((x) => x !== path);
								autoBanPaths = newAutoBanPaths;
								fs.writeFileSync('./bannedPaths.txt', autoBanPaths.join('\n'));
								res.statusCode = 200;
								res.end('Success');
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}
					if (parsedUrl.pathname.startsWith('/admin/autoban/list')) {
						if (
							req.headers['x-api-key'] !== process.env.API_KEY &&
							parsedUrl.query?.apiKey !== process.env.API_KEY
						) {
							res.statusCode = 403;
							res.end('Invalid/Missing API key');
						} else {
							try {
								res.statusCode = 200;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify(autoBanPaths));
								return;
							} catch (err) {
								res.statusCode = 500;
								res.end('Failed');
								return;
							}
						}
					}

					// Normal requests
					handle(req, res, parsedUrl).then(() => {
						// skip some requests
						if (req.url.startsWith('/_next')) return;
						if (req.url.startsWith('/admin')) return;
						if (req.url.startsWith('/scripts')) return;
						if (req.url.match(/^\/lk\/[a-zA-Z_.-]+\/[a-zA-Z]+$/)) return;

						log(
							req,
							res,
							startTime,
							'https',
							autoBanPathsRepetitions[parsedUrl.pathname]
								? autoBanPathsRepetitions[parsedUrl.pathname]
								: 0
						);
					});
				}
			)
			.listen(443, (err) => {
				if (err) throw err;
				console.log('> Ready on https://localhost:443');

				if (!process.env.API_KEY) {
					if (!fs.existsSync('./certs/api')) {
						process.env.API_KEY = crypto.randomBytes(32).toString('hex');
						fs.writeFileSync('./certs/api', process.env.API_KEY);
					} else {
						process.env.API_KEY = fs.readFileSync('./certs/api').toString();
					}
				}

				console.log(`API Key: ${process.env.API_KEY}`);
			});
	});

	http
		.createServer((req, res) => {
			const host = req.headers.host;
			res.writeHead(301, {
				Location: `https://${host}${req.url}`,
			}).end();

			log(req, res, Date.now(), 'http', false);
		})
		.listen(80, () => {
			console.log('> Ready on http://localhost:80');
		});
} else {
	app.prepare().then(() => {
		const port = parseInt(process.env.PORT, 10);

		http
			.createServer(async (req, res) => {
				const parsedUrl = parse(req.url, true);

				const startTime = Date.now();

				handle(req, res, parsedUrl).then(() => {
					// skip _next/static
					if (req.url.startsWith('/_next')) return;
					if (req.url.startsWith('/admin')) return;
					if (req.url.startsWith('/scripts')) return;
					if (req.url.match(/^\/lk\/[a-zA-Z_.-]+\/[a-zA-Z]+$/)) return;

					log(req, res, startTime, 'http', false);
				});
			})
			.listen(port, (err) => {
				if (err) throw err;
				console.log(`> Ready on https://${process.env.VERCEL_HOSTNAME}`);
			});
	});
}

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 * @param {number} startTime
 * @param {string} protocol
 * @param {boolean|number} banned
 */
function log(req, res, startTime, protocol, banned) {
	const logfile = `./logs/${new Date().toISOString().split('T')[0]}.tsv`;

	if (!fs.existsSync('./logs')) {
		fs.mkdirSync('./logs');
	}
	if (!fs.existsSync(logfile)) {
		fs.writeFileSync(
			logfile,
			`Time\tIP\tMethod\tPath\tUser-Agent\tReferer\tStatus\tResponse-Time\tResponse-Length\tProtocol\tBanned\n`
		);
		fs.chmodSync(logfile, 0o666);
	}

	fs.appendFile(
		logfile,
		`${new Date().toISOString()}\t${req.socket.remoteAddress.replace('::ffff:', '') || ''}\t${
			req.method
		}\t${req.url}\t${req.headers['user-agent']}\t${req.headers.referer || ''}\t${
			res.statusCode
		}\t${Date.now() - startTime}\t${res.getHeader('Content-Length') || 0}\t${protocol || ''}\t${
			banned.toString() || 'false'
		}\n`,
		(err) => {
			if (err) throw err;
		}
	);
}
