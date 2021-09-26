function logout() {
	document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
	location.reload();
}

function getAnalytics() {
	return new Promise((res, rej) => {
		fetch('/api/v1/admin/analytics')
			.then((r) => r.json())
			.then((r) => res(r));
	});
}

let analytics = undefined;

async function load() {
	const filter = document.getElementById('filterGermany') as HTMLInputElement;

	if (!analytics) analytics = await getAnalytics();
	const tablePages = document.getElementById('tablePages');

	tablePages.innerHTML = '';
	const tablePagesHeader = document.createElement('tr');
	tablePagesHeader.innerHTML = `
		<th>Path</th>
		<th>Clicks</th>
	`;
	tablePages.appendChild(tablePagesHeader);

	for (let page of analytics.pages) {
		const row = document.createElement('tr');

		const path = document.createElement('td');
		path.innerText = page.path;
		row.appendChild(path);

		const views = document.createElement('td');
		if (!filter.checked) views.innerText = page.apiCalls?.length || 0;
		else
			views.innerText =
				page.apiCalls?.filter((c) => c.userAgent.geoIp.country === 'Germany').length || 0;
		row.appendChild(views);

		row.onclick = () => view(page.path, 'pages');

		tablePages.appendChild(row);
	}

	const tableAPI = document.getElementById('tableAPI');

	tableAPI.innerHTML = '';
	const tableAPIHeader = document.createElement('tr');
	tableAPIHeader.innerHTML = `
		<th>Path</th>
		<th>Calls</th>
	`;
	tableAPI.appendChild(tableAPIHeader);

	for (let api of analytics.api) {
		const row = document.createElement('tr');

		const path = document.createElement('td');
		path.innerText = api.path;
		row.appendChild(path);

		const views = document.createElement('td');
		if (!filter.checked) views.innerText = api.apiCalls?.length || 0;
		else
			views.innerText =
				api.apiCalls?.filter((c) => c.userAgent.geoIp.country === 'Germany').length || 0;
		row.appendChild(views);

		row.onclick = () => view(api.path, 'api');

		tableAPI.appendChild(row);
	}
}

function view(path, type) {
	const filter = document.getElementById('filterGermany') as HTMLInputElement;

	const popup = document.getElementById('popup');
	popup.innerHTML = '';

	const title = document.createElement('h1');
	title.innerText = path;
	popup.appendChild(title);

	const close = document.createElement('button');
	close.innerText = 'Close';
	close.addEventListener('click', () => {
		popup.classList.add('hidden');
	});
	popup.appendChild(close);

	const table = document.createElement('table');

	const thead = document.createElement('thead');
	const tr = document.createElement('tr');

	let th = document.createElement('th');
	th.innerText = 'Date';
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerText = 'IP';
	tr.appendChild(th);

	if (type === 'pages') {
		th = document.createElement('th');
		th.innerText = 'OS';
		tr.appendChild(th);

		th = document.createElement('th');
		th.innerText = 'Browser';
		tr.appendChild(th);

		th = document.createElement('th');
		th.innerText = 'Device Type';
		tr.appendChild(th);
	}

	th = document.createElement('th');
	th.innerText = 'Country';
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerText = 'City';
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerText = 'ISP';
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerText = 'Reverse DNS';
	tr.appendChild(th);

	th = document.createElement('th');
	th.innerText = 'Location';
	tr.appendChild(th);

	thead.appendChild(tr);
	table.appendChild(thead);

	let pathItem = analytics[type].find((item) =>
		item.path === path && filter ? item.userAgent.geoIp.country === 'Germany' : true
	);

	if (!pathItem) return;

	for (let call of (pathItem.apiCalls || []).sort((a, b) => b.time - a.time)) {
		const row = document.createElement('tr');

		const date = document.createElement('td');
		date.innerText = new Date(call.time).toLocaleString('de-DE');
		row.appendChild(date);

		const ip = document.createElement('td');
		ip.innerText = call.ip.replace(/^::ffff:/, '');
		row.appendChild(ip);

		if (type === 'pages') {
			const os = document.createElement('td');
			os.innerText = call.userAgent.os;
			row.appendChild(os);

			const browser = document.createElement('td');
			browser.innerText = call.userAgent.browser;
			row.appendChild(browser);

			const device = document.createElement('td');
			device.innerText = call.userAgent.isMobile
				? 'Mobile'
				: call.userAgent.isDesktop
				? 'Desktop'
				: call.userAgent.isBot
				? 'Bot'
				: 'Unknown';
			row.appendChild(device);
			row.title = call.userAgent.useragent;
			row.onclick = () => {
				alert(call.userAgent.useragent);
			};
		}

		const geoCountry = document.createElement('td');
		geoCountry.innerText = call.userAgent.geoIp.country;
		row.appendChild(geoCountry);

		const geoCity = document.createElement('td');
		geoCity.innerText = call.userAgent.geoIp.city;
		row.appendChild(geoCity);

		const geoIsp = document.createElement('td');
		geoIsp.innerText = call.userAgent.geoIp.isp;
		row.appendChild(geoIsp);

		const geoReverse = document.createElement('td');
		geoReverse.innerText = call.userAgent.geoIp.reverse;
		row.appendChild(geoReverse);

		const geoLocation = document.createElement('td');
		geoLocation.innerText = `${call.userAgent.geoIp.lat}, ${call.userAgent.geoIp.lon}`;
		geoLocation.onclick = () => {
			const url = `https://www.google.com/maps/search/?api=1&query=${call.userAgent.geoIp.lat},${call.userAgent.geoIp.lon}`;
			window.open(url, '_blank');
		};
		row.appendChild(geoLocation);

		table.appendChild(row);
	}

	popup.appendChild(table);
	popup.classList.remove('hidden');
}
