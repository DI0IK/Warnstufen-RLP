import fs from 'fs';
import readline from 'readline';
import Express from 'express';

export class BanHandler {
	private file: string = '/data/banlist';

	constructor() {
		if (!fs.existsSync(this.file)) {
			fs.writeFileSync(this.file, '');
		}
	}

	public async check(ip: string, url: string): Promise<boolean> {
		this.add(ip, url);
		return new Promise((resolve, reject) => {
			const stream = fs.createReadStream(this.file);
			const rl = readline.createInterface({
				input: stream,
				crlfDelay: Infinity,
			});

			let found = false;
			rl.on('line', (line: string) => {
				if (line === ip) {
					found = true;
				}
			});
			rl.on('close', () => {
				resolve(found);
			});
		});
	}

	private add(ip: string, url: string): void {
		if (bannedRegex.some((regex) => regex.test(url))) {
			fs.appendFileSync(this.file, `${ip}\n`);
		}
	}

	public remove(ip: string): void {
		const stream = fs.createReadStream(this.file);
		const rl = readline.createInterface({
			input: stream,
			crlfDelay: Infinity,
		});

		const newFile = fs.createWriteStream(this.file);
		rl.on('line', (line: string) => {
			if (line !== ip) {
				newFile.write(`${line}\n`);
			}
		});
		rl.on('close', () => {
			newFile.end();
		});
	}

	public respond(req: Express.Request, res: Express.Response): void {
		setTimeout(() => {
			// Send banned message
			res.sendStatus(403);
		}, Math.floor(Math.random() * 1000));
	}
}

const bannedRegex = [
	/^\/shell/i,
	/^\/eval/i,
	/^\/exec/i,
	/^\/owa/i,
	/^\/_ignition/i,
	/^\/index.php/i,
	/\.env/i,
	/\.git/i,
	/^\/cgi-bin/i,
	/^\/wp-content/i,
	/^\/wp-admin/i,
	/^\/esp/i,
	/^\/\w+\.json/i,
	/^\/vendor/i,
	/^\/console/i,
	/^\/\?a\=\w+/i,
	/^\/\?XDEBUG_SESSION_START/i,
	/^\/hudson/i,
	/^\/GponForm/i,
	/^\/portal/i,
	/^\/api\/jsonws\/invoke/i,
	/^\/wls-wsat/i,
	/^\/w00t/i,
	/^\/actuator/i,
	/^\/recordings/i,
	/^\/CGI\/Execute/i,
	/^\/setup\.cgi/i,
	/^\/HNAP1/i,
	/^\/config\//i,
	/^\/mifs\//i,
];
