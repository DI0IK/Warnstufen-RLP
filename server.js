const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	http
		.createServer(async (req, res) => {
			const parsedUrl = parse(req.url, true);

			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
			res.setHeader(
				'Access-Control-Allow-Headers',
				'X-Requested-With,content-type,content-length'
			);
			res.setHeader('Access-Control-Allow-Credentials', true);

			if (process.env.WARTUNG === 'true' && parsedUrl.path !== '/maintenance') {
				res.statusCode = 302;
				res.setHeader('Location', '/maintenance');
				res.end();
				return;
			}

			handle(req, res, parsedUrl).then(() => {
				// skip some requests
				if (req.url.startsWith('/_next')) return;
				if (req.url.startsWith('/admin')) return;
				if (req.url.startsWith('/scripts')) return;
				if (req.url.match(/^\/lk\/[a-zA-Z_.-]+\/[a-zA-Z]+$/)) return;
			});
		})
		.listen(process.env.PORT ? Number.parseInt(process.env.PORT) : 80, (err) => {
			if (err) throw err;
			console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
		});
});
