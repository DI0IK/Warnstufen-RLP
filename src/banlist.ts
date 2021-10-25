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
	/\.env/i,
	/\.git/i,
	/^\/_ignition/i,
	/^\/\?a\=\w+/i,
	/^\/\?XDEBUG_SESSION_START/i,
	/^\/\w+\.json/i,
	/^\/ab2/i,
	/^\/actuator/i,
	/^\/api\/jsonws\/invoke/i,
	/^\/cgi-bin/i,
	/^\/CGI\/Execute/i,
	/^\/config\//i,
	/^\/console/i,
	/^\/cyrus/i,
	/^\/esp/i,
	/^\/eval/i,
	/^\/exec/i,
	/^\/g/i,
	/^\/GponForm/i,
	/^\/HNAP1/i,
	/^\/hudson/i,
	/^\/index.php/i,
	/^\/install/i,
	/^\/mifs\//i,
	/^\/owa/i,
	/^\/portal/i,
	/^\/recordings/i,
	/^\/setup\.cgi/i,
	/^\/shell/i,
	/^\/stalker/i,
	/^\/struts/i,
	/^\/vendor/i,
	/^\/w00t/i,
	/^\/wls-wsat/i,
	/^\/wp-admin/i,
	/^\/wp-content/i,
];
