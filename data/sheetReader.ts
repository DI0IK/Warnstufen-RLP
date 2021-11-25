import axios from 'axios';
import EventEmitter from 'events';
import excel from 'exceljs';

export default class SheetReader extends EventEmitter {
	private _url: string;
	private _sheet: excel.Worksheet;

	constructor(url: string) {
		super();
		this._url = url;

		this.updateSheet();
	}

	public updateSheet() {
		axios
			.get(this._url, {
				responseType: 'arraybuffer',
			})
			.then((response) => {
				const workbook = new excel.Workbook();
				workbook.xlsx.load(response.data);
				this._sheet = workbook.getWorksheet(1);
				this.emit('sheet-updated', this._sheet);
			});
	}

	public get sheet(): excel.Worksheet {
		return this._sheet;
	}

	public get url(): string {
		return this._url;
	}
}

export default interface SheetReader {
	on(event: 'sheet-updated', listener: (sheet: excel.Worksheet) => void): this;
}
