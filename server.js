// server.js
const https = require('https');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const fs = require('fs');

app.prepare().then(() => {
	https
		.createServer(
			{
				key: fs.readFileSync('./certs/server.key'),
				cert: fs.readFileSync('./certs/server.crt'),
			},
			(req, res) => {
				const parsedUrl = parse(req.url, true);

				handle(req, res, parsedUrl);
			}
		)
		.listen(dev ? 3000 : 443, (err) => {
			if (err) throw err;
			console.log('> Ready on https://localhost' + (dev ? ':3000' : ':443'));
		});
});

const http = require('http');

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
