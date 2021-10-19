const isOnPath = location.pathname.includes('/lk/');

function getDistrictData() {
	return new Promise<any>((resolve, reject) => {
		fetch(`/api/v2/data`, {
			headers: {
				'User-Agent': 'web-dashboard',
			},
		})
			.then((r) => r.json())
			.then((r) => resolve(r));
	});
}

function getDistricts() {
	return new Promise((resolve, reject) => {
		fetch('/api/v2/districts')
			.then((r) => r.json())
			.then((r) => resolve(r));
	});
}

async function displayDistrict(district) {
	if (!district) {
		throw new Error('No/Invalid district provided');
	}

	const aData = await getDistrictData();
	console.log(aData);
	const dData = aData.data[district];
	let data = [];
	const date8DaysAgo = new Date();
	date8DaysAgo.setDate(date8DaysAgo.getDate() - 8);
	for (let date in dData) {
		const [day, month, year] = date.split('.');
		const dateObj = new Date(
			Number.parseInt(year),
			Number.parseInt(month) - 1,
			Number.parseInt(day)
		);

		if (dateObj > date8DaysAgo) {
			data.push({ ...dData[date], Date: dateObj.getTime() });
		}
	}

	const table = document.getElementById('table');
	table.innerHTML = '';

	const header = document.createElement('tr');
	header.innerHTML = `
        <th class="date">Datum</th>
        <th><div>Inzidenz letzte 7 Tage</div><div>pro 100.000 Einwohner</div></th>
        <th><div>Hospitalisierung letzte 7 Tage</div><div>pro 100.000 Einwohner</div></th>
        <th><div>Intensivbetten belegt</div><div>in Prozent</div></th>
        <th><a href="/26teCoronaVerordnung">Warnstufe</a></th>
    `;
	table.appendChild(header);

	for (let day of data as any) {
		const Datum = day.Date;
		const { Inzidenz7Tage, Hospitalisierung7Tage, IntensivbettenProzent, Warnstufe } = day;

		const tr = document.createElement('tr');
		tr.innerHTML = `
            <td class="date">${new Date(Datum).toLocaleDateString('de-DE')}</td>
            <td>${Inzidenz7Tage}</td>
            <td>${Hospitalisierung7Tage}</td>
            <td>${IntensivbettenProzent}</td>
            <td class="W-${Warnstufe}"><a href="/26teCoronaVerordnung">${Warnstufe}</a></td>
        `;
		table.appendChild(tr);
	}

	const warnstufenItems = document.querySelectorAll('.warnstufen');
	for (let item of warnstufenItems) {
		item.addEventListener('click', () => {
			window.open('/26teCoronaVerordnung', '_blank');
		});
	}

	document.title = `Warnstufe ${district.replace('KS ', '')}`;

	checkTableWidth();
}

function loaded() {
	getDistricts().then((districts) => {
		const districtSelect = document.getElementById('district') as HTMLSelectElement;
		(districts as any[]).forEach((district) => {
			const option = document.createElement('option');
			option.value = district;
			option.innerText = district.replace('KS ', '');
			districtSelect.appendChild(option);
		});

		let index = (districts as any[]).findIndex(
			(district) =>
				district === location.hash.replace('#', '').replace(/_/g, ' ').replace(/%20/g, ' ') ||
				district ===
					location.pathname.replace('/lk/', '').replace(/_/g, ' ').replace(/%20/g, ' ')
		);
		if (index === -1) index = Number.parseInt(localStorage.getItem('district')) || 0;

		districtSelect.selectedIndex = index;

		console.log(index);

		displayDistrict(districtSelect.value);

		districtSelect.addEventListener('change', (e) => {
			const target = e.target as HTMLSelectElement;
			if (isOnPath) location.href = `/#${target.value.replace(/ /g, '_')}`;
			location.hash = target.value.replace(/ /g, '_');
			localStorage.setItem('district', target.selectedIndex.toString());
			displayDistrict(target.value);
		});
	});
}

let pageHeight = 0;

window.onscroll = function (e) {
	if (!pageHeight) pageHeight = document.body.scrollHeight;
	const scrolledTo = window.scrollY + window.innerHeight;
	const pixelsToBottom = pageHeight - scrolledTo;

	if (pixelsToBottom <= 0) {
		document.getElementById('footer').classList.add('bottom');
	} else {
		document.getElementById('footer').classList.remove('bottom');
	}
};

window.onresize = function (e) {
	checkTableWidth();
};

function checkTableWidth() {
	const tablewidth = document.getElementById('table').offsetWidth;
	const bodywidth = document.querySelector('main').offsetWidth;

	console.log(tablewidth, bodywidth);

	if (bodywidth > tablewidth) {
		document.getElementById('tableWrap').classList.add('centerItem');
		console.log('center');
	} else {
		document.getElementById('tableWrap').classList.remove('centerItem');
		console.log('left');
	}
}
