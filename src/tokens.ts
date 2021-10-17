import crypto from 'crypto';
import fs from 'fs';
import { config } from './definitions/config';

export class TokenGenerator {
	private static instance: TokenGenerator;
	private tokenFilePath: string = '/data/tokens.json';

	private constructor() {
		this.tokens = this.loadTokens();
	}

	public static getInstance(): TokenGenerator {
		if (!TokenGenerator.instance) {
			TokenGenerator.instance = new TokenGenerator();
		}
		return TokenGenerator.instance;
	}

	private loadTokens(): tokens {
		try {
			const tokens = JSON.parse(fs.readFileSync(this.tokenFilePath, 'utf8'));
			return tokens;
		} catch (e) {
			return {};
		}
	}
	private saveTokens(tokens: tokens) {
		fs.writeFileSync(this.tokenFilePath, JSON.stringify(tokens, null, 2));
	}

	tokens: tokens;

	public createToken(userId: string): string {
		const epoch = 1293840000;

		const userIdBase64 = Buffer.from(userId).toString('base64');
		const timespampBase64 = Buffer.from(String(Math.floor((Date.now() - epoch) / 1000))).toString(
			'base64'
		);
		const hmac = crypto.createHmac('sha256', config.api.secret);

		const token = `${userIdBase64}.${timespampBase64}.${hmac
			.update(userIdBase64 + timespampBase64)
			.digest('base64')}`;

		this.tokens[userIdBase64] = {
			token,
			permissions: [
				{
					path: '/api/v2/data',
					limitMultiplicator: 2,
				},
				{
					path: '/api/v2/districts',
					limitMultiplicator: 2,
				},
			],
			groups: [],
		};

		this.saveTokens(this.tokens);
		return token;
	}

	public getPermissions(token: string | undefined): token {
		if (!token)
			return {
				token: '',
				permissions: [],
				groups: [],
			};
		const [userIdBase64, timespampBase64, hmac] = token.split('.');
		const hmacBase64 = crypto
			.createHmac('sha256', config.api.secret)
			.update(userIdBase64 + timespampBase64)
			.digest('base64');
		if (hmac !== hmacBase64) {
			return {
				token: '',
				permissions: [],
				groups: [],
			};
		}

		return this.tokens[userIdBase64];
	}
}

interface tokens {
	[userId: string]: token;
}

interface token {
	token: string;
	permissions: permission[];
	groups: string[];
}

interface permission {
	path: string;
	limitMultiplicator: number;
}
