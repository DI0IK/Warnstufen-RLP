async function updateAnalytics() {
	const germanyOnly = (document.querySelector('#germanyOnly') as HTMLInputElement).checked;
	const dateInput = document.querySelector('.date-input') as HTMLInputElement;
	const date = new Date(dateInput.value);
	const data = await fetchAnalytics(date);
	const dayData = data.filter((item) => {
		const datetime = new Date(item.time);
		if (germanyOnly && item.geoip.country !== 'Germany') {
			return false;
		}
		return (
			datetime.getDate() === date.getDate() &&
			datetime.getMonth() === date.getMonth() &&
			datetime.getFullYear() === date.getFullYear() &&
			!item.url.match(/\.(?:scss|ts)$/) &&
			!item.url.match(/\/admin/) &&
			!item.url.match(/\/api\/v(?:1|2)\//)
		);
	});

	takenRandomColors = new Set();

	const countrys = dayData
		.map((item) => (germanyOnly ? item.geoip.city || 'unknown' : item.geoip.country || 'unknown'))
		.filter((item, index, array) => array.indexOf(item) === index);

	const pages = dayData
		.map((item) => item.url)
		.filter((item, index, array) => array.indexOf(item) === index);

	const referer = dayData
		.map((item) => item.headers.referer)
		.filter((item, index, array) => array.indexOf(item) === index);

	const clicksPerHour = dayData.reduce((acc, item) => {
		const hour = new Date(item.time).getHours();
		if (acc[hour]) {
			acc[hour].clicks++;
			acc[hour].items.push(item);
		} else {
			acc[hour] = {
				hour: hour,
				clicks: 1,
				items: [item],
			};
		}
		return acc;
	}, []);

	if (CHART) CHART.destroy();
	switch ((document.querySelector('#chart-type') as HTMLSelectElement).value) {
		case 'clicks-per-country':
			// @ts-ignore
			CHART = new Chart(document.getElementById('analyticsChartCanvas'), {
				type: 'bar',
				data: {
					labels: [
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
						23,
					].map((hour) => {
						return `${hour} Uhr`;
					}),

					datasets: [
						...countrys.map((country) => {
							return {
								label: country,
								data: clicksPerHour.map((hour) => {
									return hour.items.filter((item) =>
										germanyOnly
											? item.geoip.city || 'unknown' === country
											: item.geoip.country || 'unknown' === country
									).length;
								}),
								backgroundColor: getRandomColor(),
							};
						}),
					],
				},
				options: chartOptions,
			});
			break;
		case 'clicks-per-page':
			// @ts-ignore
			CHART = new Chart(document.getElementById('analyticsChartCanvas'), {
				type: 'bar',
				data: {
					labels: [
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
						23,
					].map((hour) => {
						return `${hour} Uhr`;
					}),

					datasets: [
						...pages.map((page) => {
							return {
								label: page,
								data: clicksPerHour.map((hour) => {
									return hour.items.filter((item) => item.url === page).length;
								}),
								backgroundColor: getRandomColor(),
							};
						}),
					],
				},
				options: chartOptions,
			});
			break;
		case 'clicks-per-referer':
			// @ts-ignore
			CHART = new Chart(document.getElementById('analyticsChartCanvas'), {
				type: 'bar',
				data: {
					labels: [
						0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
						23,
					].map((hour) => {
						return `${hour} Uhr`;
					}),
					datasets: [
						...referer.map((page) => {
							return {
								label: page,
								data: clicksPerHour.map((hour) => {
									return hour.items.filter((item) => item.headers.referer === page).length;
								}),
								backgroundColor: getRandomColor(),
							};
						}),
					],
				},
				options: chartOptions,
			});
			break;
		default:
			console.log('default');
			break;
	}
}

function setupDateInputs() {
	const dateInput = document.querySelector('.date-input') as HTMLInputElement;
	dateInput.value = new Date().toISOString().split('T')[0];
	dateInput.addEventListener('change', (e) => {
		if (dateInput.value === '') {
			dateInput.value = new Date().toISOString().split('T')[0];
		}
		updateAnalytics();
	});

	updateAnalytics();
}

let analytics: {
	geoip: {
		country: string;
		region: string;
		city: string;
	};
	headers: {
		[key: string]: string;
	};
	ip: string;
	method: string;
	query: {
		[key: string]: string;
	};
	time: string;
	url: string;
}[] = [];

async function fetchAnalytics(date: Date) {
	return new Promise<
		{
			geoip: {
				country: string;
				region: string;
				city: string;
			};
			headers: {
				[key: string]: string;
			};
			ip: string;
			method: string;
			query: {
				[key: string]: string;
			};
			time: string;
			url: string;
		}[]
	>((resolve, reject) => {
		fetch(`/admin/analytics/${date.toISOString().split('T')[0]}`)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				resolve(data.route || []);
				updateWSList(data.ws || []);
			});
	});
}

let takenRandomColors = new Set<string>();
function getRandomColor() {
	let color = '#';
	for (let i = 0; i < 3; i++) {
		color += Math.floor(Math.random() * 16).toString(16) + '0';
	}
	if (takenRandomColors.has(color)) {
		return getRandomColor();
	}
	takenRandomColors.add(color);
	return color;
}

let CHART = null;

const chartOptions = {
	scales: {
		x: {
			stacked: true,
		},
		y: {
			stacked: true,
			beginAtZero: true,
		},
	},
};

function updateWSList(data: any) {
	const connectedWS = data.filter((ws) => !ws.disconnectedTime);
	for (const ws of connectedWS) {
		const wsItem = document.createElement('li');
		wsItem.classList.add('list-group-item');
		wsItem.innerText = `${ws.ip} - ${ws.time}`;
		document.getElementById('wsList').appendChild(wsItem);
	}
}
