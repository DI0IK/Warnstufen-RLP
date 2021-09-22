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

let analytics = {};

async function load() {
	analytics = await getAnalytics();
	const tablePages = document.getElementById('tablePages');

	for (let page of analytics.pages) {
		const row = document.createElement('tr');

		const path = document.createElement('td');
		path.innerText = page.path;
		row.appendChild(path);

		const views = document.createElement('td');
		views.innerText = page.apiCalls?.length || 0;
		row.appendChild(views);

		row.onclick = () => view(page.path, 'pages');

		tablePages.appendChild(row);
	}

	const tableAPI = document.getElementById('tableAPI');

	for (let api of analytics.api) {
		const row = document.createElement('tr');

		const path = document.createElement('td');
		path.innerText = api.path;
		row.appendChild(path);

		const views = document.createElement('td');
		views.innerText = api.apiCalls?.length || 0;
		row.appendChild(views);

		row.onclick = () => view(api.path, 'api');

		tableAPI.appendChild(row);
	}
}

function view(path, type) {
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

		th = document.createElement('th');
		th.innerText = 'Geo ip';
		tr.appendChild(th);
	}

	thead.appendChild(tr);
	table.appendChild(thead);

	const pathItem = analytics[type].find((item) => item.path === path);

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

			const geo = document.createElement('td');
			geo.innerText = JSON.stringify(call.geoIp);
			row.appendChild(geo);
		}

		table.appendChild(row);
	}

	popup.appendChild(table);
	popup.classList.remove('hidden');
}
