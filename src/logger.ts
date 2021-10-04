import fs from 'fs';

export class Logger {
	options: Options;
	constructor(options: Options) {
		this.options = options;
	}

	log(message: string, ...args: any[]) {
		if (this.options.log) {
			console.log(message, ...args);
		}
		fs.appendFileSync(this.options.logFiles.log, `${message}\n`, { encoding: 'utf8' });
	}

	propertyAccess(ip: string, path: string, reqData: any) {
		if (this.options.log) {
			console.log(`${ip} accessed ${path} with ${JSON.stringify(reqData)}`);
		}
		fs.appendFileSync(
			this.options.logFiles.access,
			`${ip}\t${path}\t${JSON.stringify(reqData)}\n`,
			{ encoding: 'utf8' }
		);
	}
}

interface Options {
	logFiles: {
		log: string;
		access: string;
	};
	log: boolean;
}
