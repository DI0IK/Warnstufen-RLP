const https = require('https');
const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const fs = require('fs');

const onVercel = process.env.VERCEL_URL !== undefined;

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
							const data = fs.readFileSync(
								`./logs/${date || new Date().toISOString().split('T')[0]}.tsv`
							);
							res.writeHead(200, {
								'Content-Type': 'text/tab-separated-values',
								'Content-Length': data.length,
							});
							res.end(data);
							return;
						}
					}

					handle(req, res, parsedUrl).then(() => {
						// skip _next/static
						if (req.url.startsWith('/_next/static/')) return;

						log(req, res, startTime);
					});
				}
			)
			.listen(443, (err) => {
				if (err) throw err;
				console.log('> Ready on https://localhost:443');
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
					if (req.url.startsWith('/_next/static/')) return;

					log(req, res, startTime);
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
 */
function log(req, res, startTime) {
	const logfile = `./logs/${new Date().toISOString().split('T')[0]}.tsv`;

	if (!fs.existsSync('./logs')) {
		fs.mkdirSync('./logs');
	}
	if (!fs.existsSync(logfile)) {
		fs.writeFileSync(
			logfile,
			`Time\tIP\tMethod\tPath\tUser-Agent\tReferer\tStatus\tResponse-Time\tResponse-Length\n`
		);
		fs.chmodSync(logfile, 0o666);
	}

	fs.appendFile(
		logfile,
		`${new Date().toISOString()}\t${req.socket.remoteAddress || ''}\t${req.method}\t${req.url}\t${
			req.headers['user-agent']
		}\t${req.headers.referer || ''}\t${res.statusCode}\t${Date.now() - startTime}\t${
			res.getHeader('Content-Length') || 0
		}\n`,
		(err) => {
			if (err) throw err;
		}
	);
}
