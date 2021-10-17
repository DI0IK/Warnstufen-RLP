import { District } from './districts';

export interface APIData {
	data: {
		[district in District]: {
			[date: APIDate]: {
				Inzidenz7Tage: number;
				Hospitalisierung7Tage: number;
				IntensivbettenProzent: number;
				Warnstufe: number;
			};
		};
	};
	github: string;
	author: string;
}

export type APIDate = `${number}${number}.${number}${number}.${number}${number}${number}${number}`;