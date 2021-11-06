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
					cert:
						fs.readFileSync('./certs/server.crt') +
						fs.readFileSync('./certs/intermediate.crt'),
				},
				(req, res) => {
					const parsedUrl = parse(req.url, true);

					res.setHeader('Access-Control-Allow-Origin', '*');
					res.setHeader(
						'Access-Control-Allow-Methods',
						'GET, POST, OPTIONS, PUT, PATCH, DELETE'
					);
					res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
					res.setHeader('Access-Control-Allow-Credentials', true);

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
