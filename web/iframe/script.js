let urlParams = {};
for (let item of window.location.search.substring(1).split('&')) {
	urlParams[item.split('=')[0]] = item.split('=')[1];
}

function getData() {
	return new Promise((resolve, reject) => {
		if (!urlParams.district) reject('district is required');
		fetch(`/api/v1/data?district=${urlParams.district}&last=3`)
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
		${urlParams.Inzidenz ? `<th>Inzidenz</th>` : ''}
	`;
	table.appendChild(tableHead);
	for (let item of data.data) {
		const htmlItem = document.createElement('tr');
		htmlItem.innerHTML = `
			<td class="day">${day}</td>
			<td class="Warnstufe">${item.Warnstufe}</td>
			${urlParams.Inzidenz ? `<td class="Inzidenz">${item.Inzidenz7Tage}</td>` : ''}
		`;
		table.appendChild(htmlItem);
		day++;
	}
});

window.addEventListener(
	'message',
	(e) => {
		const style = document.createElement('style');
		style.innerHTML = e.data;
		document.body.appendChild(style);
	},
	false
);

function getDay(item) {
	const date = new Date(item.Date);
	const zeroD = Date.now();
	const oneD = Date.now() - 1000 * 60 * 60 * 24;
	const twoD = Date.now() - 1000 * 60 * 60 * 48;
	return date < zeroD && date > oneD
		? 'Heute'
		: date < oneD && date > twoD
		? 'Gestern'
		: date < twoD
		? 'Vorgestern'
		: date.getDate() + '.';
}
