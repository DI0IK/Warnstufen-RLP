let urlParams = {};
for (let item of window.location.search.substring(1).split('&')) {
	urlParams[item.split('=')[0]] = item.split('=')[1];
}

let args = urlParams['args']?.split(';').map((i: string) => i.toLowerCase()) || [];

function getData() {
	return new Promise((resolve, reject) => {
		if (!urlParams['district']) reject('district is required');
		fetch(`/api/v1/data?district=${urlParams['district']}&last=3`)
			.then((r) => r.json())
			.then((data) => {
				resolve(data);
			});
	});
}

getData().then((data) => {
	let day = 1;
	const table = document.getElementById('table');
	const tableHead = document.createElement('tr');
	tableHead.innerHTML = `
		<th>Tag</th>
		<th>Warnstufe</th>
		${args.includes('inzidenz') ? `<th>Inzidenz</th>` : ''}
		${args.includes('hospitalisierung') ? `<th>Hospitalisierung</th>` : ''}
		${args.includes('intensivbetten') ? `<th>Intensivbetten %</th>` : ''}
	`;
	table.appendChild(tableHead);
	for (let item of (data as any).data) {
		const htmlItem = document.createElement('tr');
		htmlItem.innerHTML = `
			<td class="Tag">${getDay(item)}</td>
			<td class="Warnstufe">${item.Warnstufe}</td>
			${args.includes('inzidenz') ? `<td class="Inzidenz">${item.Inzidenz7Tage}</td>` : ''}
			${
				args.includes('hospitalisierung')
					? `<td class="Hospitalisierung">${item.Hospitalisierung7Tage}</td>`
					: ''
			}
			${
				args.includes('intensivbetten')
					? `<td class="Intensivbetten">${item.IntensivbettenProzent}</td>`
					: ''
			}
		`;
		table.appendChild(htmlItem);
		day++;
	}

	if (args.includes('nolink')) {
		document.getElementById('link').style.display = 'none';
	}
});

window.addEventListener(
	'message',
	(e) => {
		const style = document.createElement('style');
		style.innerText = e.data;
		document.body.appendChild(style);
	},
	false
);

function getDay(item) {
	const date = new Date(item.Date);
	const zeroD = Date.now();
	const oneD = Date.now() - 1000 * 60 * 60 * 24;
	const twoD = Date.now() - 1000 * 60 * 60 * 48;
	return date.getTime() < zeroD && date.getTime() > oneD
		? 'Heute'
		: date.getTime() < oneD && date.getTime() > twoD
		? 'Gestern'
		: date.getTime() < twoD
		? 'Vorgestern'
		: date.getDate() + '.';
}
