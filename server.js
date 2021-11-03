// server.js
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
					cert: fs.readFileSync('./certs/server.crt'),
				},
				(req, res) => {
					const parsedUrl = parse(req.url, true);

					log(req, res, parsedUrl);

					handle(req, res, parsedUrl);
				}
			)
			.listen(dev ? 3000 : 443, (err) => {
				if (err) throw err;
				console.log('> Ready on https://localhost' + (dev ? ':3000' : ':443'));
			});
	});

	http
		.createServer((req, res) => {
			const redirectPort = dev ? ':3000' : '';
			const host = req.headers.host + redirectPort;
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
			.createServer((req, res) => {
				const parsedUrl = parse(req.url, true);

				handle(req, res, parsedUrl);
			})
			.listen(port, (err) => {
				if (err) throw err;
				console.log(`> Ready on https://${process.env.VERCEL_HOSTNAME}`);
			});
	});
}

function log(req, res, parsedUrl) {
	const data = {
		method: req.method,
		url: parsedUrl.pathname,
		'headers.user-agent': req.headers['user-agent'],
		'headers.referer': req.headers.referer,
		'headers.host': req.headers.host,

		ip: req.socket.remoteAddress.replace('::ffff:', ''),
		hasBody: !!req.body,
		time: new Date().getTime(),
	};

	const header = Object.keys(data).join('\t');
	const item = Object.values(data).join('\t');

	if (!fs.existsSync('./logs/log.txt')) {
		fs.writeFileSync('./logs/log.txt', header + '\n');
	}

	fs.appendFileSync('./logs/log.txt', item + '\n');
}
