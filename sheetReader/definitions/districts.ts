export type APIDistrict =
	| 'Ahrweiler'
	| 'Altenkirchen'
	| 'Cochem-Zell'
	| 'KS Koblenz'
	| 'Mayen-Koblenz'
	| 'Neuwied'
	| 'Rhein-Hunsrück'
	| 'Rhein-Lahn'
	| 'Westerwaldkreis'
	| 'Alzey-Worms'
	| 'Bad Kreuznach'
	| 'Birkenfeld'
	| 'Mainz-Bingen'
	| 'KS Mainz'
	| 'KS Worms'
	| 'Bad Dürkheim'
	| 'KS Neustadt a.d.W.'
	| 'KS Landau i.d.Pf.'
	| 'Südliche Weinstr.'
	| 'KS Frankenthal'
	| 'Rhein-Pfalz-Kreis'
	| 'KS Ludwigshafen'
	| 'Germersheim'
	| 'KS Speyer'
	| 'Bernkastel-Wittlich'
	| 'Bitburg-Prüm'
	| 'Trier-Saarburg'
	| 'KS Trier'
	| 'Vulkaneifel'
	| 'Donnersbergkreis'
	| 'Kaiserslautern'
	| 'KS Kaiserslautern'
	| 'Kusel'
	| 'KS Pirmasens'
	| 'Südwestpfalz'
	| 'KS Zweibrücken';

export type VersorgungsgebieteDistricts =
	| 'Versorgungsgebiet Mittelrhein-Westerwald'
	| 'Versorgungsgebiet Rheinhessen-Nahe'
	| 'Versorgungsgebiet Rheinpfalz'
	| 'Versorgungsgebiet Trier'
	| 'Versorgungsgebiet Westpfalz';

export type RLPDistrict = 'Rheinland-Pfalz';

export type District = APIDistrict | VersorgungsgebieteDistricts | RLPDistrict;

export const APIDistrict = [
	'Ahrweiler',
	'Altenkirchen',
	'Cochem-Zell',
	'KS Koblenz',
	'Mayen-Koblenz',
	'Neuwied',
	'Rhein-Hunsrück',
	'Rhein-Lahn',
	'Westerwaldkreis',
	'Alzey-Worms',
	'Bad Kreuznach',
	'Birkenfeld',
	'Mainz-Bingen',
	'KS Mainz',
	'KS Worms',
	'Bad Dürkheim',
	'KS Neustadt a.d.W.',
	'KS Landau i.d.Pf.',
	'Südliche Weinstr.',
	'KS Frankenthal',
	'Rhein-Pfalz-Kreis',
	'KS Ludwigshafen',
	'Germersheim',
	'KS Speyer',
	'Bernkastel-Wittlich',
	'Bitburg-Prüm',
	'Trier-Saarburg',
	'KS Trier',
	'Vulkaneifel',
	'Donnersbergkreis',
	'Kaiserslautern',
	'KS Kaiserslautern',
	'Kusel',
	'KS Pirmasens',
	'Südwestpfalz',
	'KS Zweibrücken',
];

export const VersorgungsgebieteDistricts = [
	'Versorgungsgebiet Mittelrhein-Westerwald',
	'Versorgungsgebiet Rheinhessen-Nahe',
	'Versorgungsgebiet Rheinpfalz',
	'Versorgungsgebiet Trier',
	'Versorgungsgebiet Westpfalz',
];

export const RLPDistrict = ['Rheinland-Pfalz'];

export const District = [...APIDistrict, ...VersorgungsgebieteDistricts, ...RLPDistrict];
