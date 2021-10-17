import { Request, Response } from 'express';
import axios from 'axios';
import ws from 'ws';

export class Analytics {
	private static instance: Analytics;

	private constructor() {}

	public static getInstance(): Analytics {
		if (!Analytics.instance) {
			Analytics.instance = new Analytics();
		}
		return Analytics.instance;
	}

	public async routeCalled(req: Request, res: Response): Promise<void> {
		const data = {
			url: req.url,
			method: req.method,
			ip: req.ip,
			headers: req.headers,
			body: req.body,
			query: req.query,
			geoip: await this.getGeoIPData(req.ip),
		};
	}

	public async wsConnected(ws: ws, ip: string | undefined): Promise<void> {
		const data = {
			ip,
			geoip: await this.getGeoIPData(ip),
		};
	}

	private _ipGeoCache: any = {};
	private async getGeoIPData(ip: string | undefined): Promise<any> {
		if (!ip) return null;
		if (this._ipGeoCache[ip]) {
			return this._ipGeoCache[ip];
		}
		const data = await axios.get(`http://ip-api.com/json/${ip}?fields=556793`);
		this._ipGeoCache[ip] = data.data;
		return data;
	}
}
