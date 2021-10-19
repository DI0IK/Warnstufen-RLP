import { Request, Response } from 'express';
import axios from 'axios';
import ws from 'ws';
import fs from 'fs';

export class Analytics {
	private static instance: Analytics;

	private dataFilePath: string = '/data/analytics-%%date%%.json';

	private _routeData: data[] = [];
	private _wsData: data[] = [];

	private constructor() {
		this.loadAnalytics();
	}

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
			query: req.query,
			geoip: await this.getGeoIPData(req.ip),
			time: new Date().toISOString(),
		};
		this._routeData.push(data);
		this.saveAnalytics();
	}

	public async wsConnected(ws: ws, ip: string | undefined): Promise<void> {
		const data = {
			ip,
			geoip: await this.getGeoIPData(ip),
			time: new Date().toISOString(),
		};
		this._wsData.push(data);
		this.saveAnalytics();
	}

	public wsDisconnected(ws: ws, ip: string | undefined): void {
		const index = this._wsData.findIndex((data) => data.ip === ip);
		if (index !== -1) {
			this._wsData[index].disconnectTime = new Date().toISOString();
		}
		this.saveAnalytics();
	}

	private _ipGeoCache: any = {};
	private async getGeoIPData(ip: string | undefined): Promise<any> {
		if (!ip) return null;
		if (this._ipGeoCache[ip]) {
			return this._ipGeoCache[ip];
		}
		const data = await axios.get(`http://ip-api.com/json/${ip}?fields=556793`, {
			responseType: 'json',
		});
		this._ipGeoCache[ip] = data.data;
		return data.data;
	}

	public get routeData() {
		return this._routeData;
	}
	public get wsData() {
		return this._wsData;
	}

	private saveAnalytics(): void {
		const date = new Date().toISOString().split('T')[0];
		const filePath = this.dataFilePath.replace('%%date%%', date);
		const json = JSON.stringify({
			route: this._routeData.filter((data) => {
				const date = new Date(data.time);
				return (
					date.getDate() === new Date().getDate() &&
					date.getMonth() === new Date().getMonth() &&
					date.getFullYear() === new Date().getFullYear()
				);
			}),
			ws: this._wsData.filter((data) => {
				const date = new Date(data.time);
				return (
					date.getDate() === new Date().getDate() &&
					date.getMonth() === new Date().getMonth() &&
					date.getFullYear() === new Date().getFullYear()
				);
			}),
		});
		fs.writeFileSync(filePath, json);
		this.loadAnalytics();
	}

	private async loadAnalytics(): Promise<void> {
		const date = new Date().toISOString().split('T')[0];
		const filePath = this.dataFilePath.replace('%%date%%', date);
		if (!fs.existsSync(filePath)) return;
		const json = fs.readFileSync(filePath, 'utf8');
		const data = JSON.parse(json);
		this._routeData = data.route;
		this._wsData = data.ws;
	}
}

interface data {
	ip?: string;
	geoip?: any;
	url?: string;
	method?: string;
	headers?: any;
	query?: any;
	time: string;
	disconnectTime?: string;
}
