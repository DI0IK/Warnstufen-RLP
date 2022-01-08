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

					if (bannedIPs.includes(req.socket.remoteAddress.replace('::ffff:', ''))) {
						res.statusCode = 403;
						res.end('Forbidden');
						return;
					}

					const startTime = Date.now();

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
									fs.writeFileSync('./bannedIPs.txt', bannedIPs.join('\n'));
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

					handle(req, res, parsedUrl).then(() => {
						// skip some requests
						if (req.url.startsWith('/_next')) return;
						if (req.url.startsWith('/admin')) return;
						if (req.url.startsWith('/scripts')) return;
						if (req.url.match(/^\/lk\/[a-zA-Z_.-]+\/[a-zA-Z]+$/)) return;

						log(req, res, startTime, 'https');
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

					log(req, res, startTime, 'http');
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
 */
function log(req, res, startTime, protocol) {
	const logfile = `./logs/${new Date().toISOString().split('T')[0]}.tsv`;

	if (!fs.existsSync('./logs')) {
		fs.mkdirSync('./logs');
	}
	if (!fs.existsSync(logfile)) {
		fs.writeFileSync(
			logfile,
			`Time\tIP\tMethod\tPath\tUser-Agent\tReferer\tStatus\tResponse-Time\tResponse-Length\tProtocol\n`
		);
		fs.chmodSync(logfile, 0o666);
	}

	fs.appendFile(
		logfile,
		`${new Date().toISOString()}\t${req.socket.remoteAddress.replace('::ffff:', '') || ''}\t${
			req.method
		}\t${req.url}\t${req.headers['user-agent']}\t${req.headers.referer || ''}\t${
			res.statusCode
		}\t${Date.now() - startTime}\t${res.getHeader('Content-Length') || 0}\t${protocol || ''}\n`,
		(err) => {
			if (err) throw err;
		}
	);
}
