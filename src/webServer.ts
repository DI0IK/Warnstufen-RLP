import express from 'express';
import { Server as httpServer } from 'http';
import { Server as httpsServer } from 'https';
import fs from 'fs';
import { config } from './definitions/config';
import { Reader } from './sheetReader';
import { Analytics } from './analytics';
import { Router } from './routes';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';

export class WebServer {
	private _app: express.Application = express();
	private _router: express.Router;
	private _httpServer: httpServer = new httpServer(this._app);
	private _httpsServer: httpsServer = new httpsServer(
		{
			key: fs.readFileSync('/certs/server.key'),
			cert: fs.readFileSync('/certs/server.cer'),
		},
		this._app
	);

	private _reader: Reader;
	private _analytics: Analytics;

	constructor(reader: Reader) {
		this.init();
		this._reader = reader;
		this._analytics = Analytics.getInstance();
		this._router = new Router(this._reader).router;
	}

	private init(): void {
		this._app.use(express.json());
		this._app.use(express.urlencoded({ extended: false }));
		this._app.use(useragent.express());
		this._app.use(cookieParser());
		this._app.use((req, res, next) => {
			this._analytics.routeCalled(req, res);
			this._router(req, res, next);
		});
	}

	public start(): void {
		this._httpServer.listen(config.api.httpPort, () => {
			console.log('HTTP Server running on port', config.api.httpPort);
		});

		this._httpsServer.listen(config.api.httpsPort, () => {
			console.log('HTTPS Server running on port', config.api.httpsPort);
		});
	}
}
