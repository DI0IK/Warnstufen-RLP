function getDistrictData(district = 'all', last = 8) {
	return new Promise((resolve, reject) => {
		if (district !== 'all') {
			fetch(`/api/v1/data?district=${district}&last=${last}`, {
				headers: {
					'User-Agent': 'web-dashboard',
				},
			})
				.then((r) => r.json())
				.then((r) => resolve(r));
		} else {
			fetch(`/api/v1/data?last=${last}`, {
				headers: {
					'User-Agent': 'web-dashboard',
				},
			})
				.then((r) => r.json())
				.then((r) => resolve(r));
		}
	});
}

function getDistricts() {
	return new Promise((resolve, reject) => {
		fetch('/api/v1/districts')
			.then((r) => r.json())
			.then((r) => resolve(r));
	});
}

async function displayDistrict(district) {
	if (!district) {
		throw new Error('No/Invalid district provided');
	}
	const data = await getDistrictData(district);

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

	for (let day of (data as any).data) {
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

getDistricts().then((districts) => {
	const districtSelect = document.getElementById('district') as HTMLSelectElement;
	(districts as any[]).forEach((district) => {
		const option = document.createElement('option');
		option.value = district;
		option.innerText = district;
		districtSelect.appendChild(option);
	});

	if (location.hash) {
		districtSelect.selectedIndex = (districts as any[]).indexOf(
			location.hash.substr(1).replace(/%20/g, ' ')
		);

		try {
			displayDistrict(districtSelect.value);
		} catch (error) {
			districtSelect.selectedIndex =
				Number.parseInt(localStorage.getItem('district')) || (districts as any[]).length - 10;

			displayDistrict(districtSelect.value);
		}
	} else if (location.pathname.startsWith('/lk/')) {
		districtSelect.selectedIndex =
			(districts as any[]).indexOf(location.pathname.substr(4).replace(/_/g, ' ')) ||
			(districts as any[]).length - 10;

		displayDistrict(districtSelect.value);
	} else {
		districtSelect.selectedIndex =
			Number.parseInt(localStorage.getItem('district')) || (districts as any[]).length - 10;

		displayDistrict(districtSelect.value);
	}

	districtSelect.addEventListener('change', (e) => {
		const target = e.target as HTMLSelectElement;
		location.hash = target.value;
		localStorage.setItem('district', target.selectedIndex.toString());
		if (location.pathname.startsWith('/lk/')) {
			location.pathname = `/`;
		}
		displayDistrict(target.value);
	});
});

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
