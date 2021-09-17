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
	const data = await getDistrictData(district);

	const table = document.getElementById('table');
	table.innerHTML = '';

	const header = document.createElement('tr');
	header.innerHTML = `
        <th class="date">Datum</th>
        <th><div>Inzidenz letzte 7 Tage</div><div>pro 100.000 Einwohner</div></th>
        <th><div>Hospitalisierung letzte 7 Tage</div><div>pro 100.000 Einwohner</div></th>
        <th><div>Intensivbetten belegt</div><div>in Prozent</div></th>
        <th>Warnstufe</th>
    `;
	table.appendChild(header);

	for (let day of data.data) {
		const Datum = day.Date;
		const { Inzidenz7Tage, Hospitalisierung7Tage, IntensivbettenProzent, Warnstufe } = day;

		const tr = document.createElement('tr');
		tr.innerHTML = `
            <td class="date">${new Date(Datum).toLocaleDateString('de-DE')}</td>
            <td>${Inzidenz7Tage}</td>
            <td>${Hospitalisierung7Tage}</td>
            <td>${IntensivbettenProzent}</td>
            <td>${Warnstufe}</td>
        `;
		table.appendChild(tr);
	}
}

getDistricts().then((districts) => {
	const districtSelect = document.getElementById('district');
	districts.forEach((district) => {
		const option = document.createElement('option');
		option.value = district;
		option.innerText = district;
		districtSelect.appendChild(option);
	});

	districtSelect.addEventListener('change', (e) => {
		displayDistrict(e.target.value);
		localStorage.setItem('district', e.target.selectedIndex);
	});

	districtSelect.selectedIndex = localStorage.getItem('district') || districts.length - 10;

	displayDistrict(districtSelect.value);
});

// Click Clounter

function getClicks() {
	return new Promise((resolve, reject) => {
		fetch('/api/v1/clicks')
			.then((r) => r.json())
			.then((r) => resolve(r));
	});
}

function updateClicks() {
	getClicks().then((clicks) => {
		document.getElementById('clicks').innerText = clicks.count;
	});
}

setInterval(() => {
	updateClicks();
}, 60 * 1000);
updateClicks();
