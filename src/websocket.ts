import ws from 'ws';
import { Analytics } from './analytics';
import { APIData } from './definitions/data';

export class Websocket {
	private _wss: ws.WebSocketServer;

	constructor() {
		this._wss = new ws.WebSocketServer({ port: 8080 });
		this.init();
	}

	private init() {
		this._wss.on('connection', (ws, req) => {
			(ws as any).isAlive = true;

			setInterval(() => {
				if (!(ws as any).isAlive) ws.close();
				(ws as any).isAlive = false;
				ws.ping();
			}, 60 * 1000);

			ws.on('pong', () => {
				(ws as any).isAlive = true;
			});

			ws.on('message', () => {
				ws.send(Websocket._cache);
			});

			ws.on('close', () => {
				Analytics.getInstance().wsDisconnected(
					ws,
					String(req.headers['x-forwarded-for']) || req.socket.remoteAddress
				);
			});

			Analytics.getInstance().wsConnected(
				ws,
				String(req.headers['x-forwarded-for']) || req.socket.remoteAddress
			);
		});
	}

	get websocket() {
		return this._wss;
	}

	private static _cache: string | undefined;

	public update(data: APIData) {
		if (Websocket._cache !== JSON.stringify(data)) {
			if (this._wss && this._wss.clients.size > 0) {
				this._wss?.clients.forEach((client) => {
					if (client.readyState === ws.OPEN) {
						client.send(JSON.stringify(data));
					}
				});
			}
		}
		Websocket._cache = JSON.stringify(data);
	}
}
