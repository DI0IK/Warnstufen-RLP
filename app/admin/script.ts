import { Chart as c } from 'chart.js';

// @ts-ignore
const chart: typeof c = Chart as any as c;

let CHART_INSTANCE: c;

async function displayChart(
	timeFrame: 'day' | 'hour' | 'minute',
	date: Date,
	filters: {
		prop: string;
		value: string | number;
	}[],
	displayType: 'url' | 'country' | 'referrer'
) {
	const rawData = await getData(date);
	if (rawData.error) return;
	const data = rawData.route;
	const labels = timeFrame === 'day' ? Array.from(Array(24).keys()) : Array.from(Array(60).keys());

	let filteredData = data.filter((item) => {
		if (/^\/lk\/.*/i.test(item.url)) item.url = '/lk';
		const datetime = new Date(item.time);
		return (
			datetime.getDate() === date.getDate() &&
			datetime.getMonth() === date.getMonth() &&
			datetime.getFullYear() === date.getFullYear() &&
			!item.url.match(/\.(?:scss|ts)$/) &&
			!item.url.match(/\/admin/) &&
			!item.url.match(/\/api\/v(?:1|2)\//) &&
			(timeFrame === 'day'
				? true
				: timeFrame === 'hour'
				? datetime.getHours() === date.getHours()
				: datetime.getMinutes() === date.getMinutes())
		);
	});

	for (const filter of filters) {
		filteredData = filteredData.filter((item) => {
			const path = filter.prop.split('.');
			let value = item;
			for (const prop of path) {
				value = value[prop];
			}
			return (value as any) === filter.value;
		});
	}

	const dataEntries =
		displayType === 'url'
			? filteredData
					.map((item) => item.url)
					.filter((item, index, array) => array.indexOf(item) === index)
			: displayType === 'country'
			? filteredData
					.map((item) => item.geoip.country)
					.filter((item, index, array) => array.indexOf(item) === index)
			: displayType === 'referrer'
			? filteredData
					.map((item) => item.headers.referer)
					.filter((item, index, array) => array.indexOf(item) === index)
			: [];

	if (CHART_INSTANCE) CHART_INSTANCE.destroy();

	CHART_INSTANCE = new chart(document.getElementById('chart'), {
		type: 'bar',
		data: {
			labels: labels.map(
				(h) => `${h}${timeFrame === 'day' ? ' Uhr' : timeFrame === 'hour' ? ' min' : ' sec'}`
			),
			datasets: dataEntries.map((entry) => {
				const { cbg, cbd } = getRandomColor(entry);
				return {
					label: entry,
					data: labels.map(
						(label) =>
							(displayType === 'url'
								? filteredData.filter((item) => item.url === entry)
								: displayType === 'country'
								? filteredData.filter((item) => item.geoip.country === entry)
								: displayType === 'referrer'
								? filteredData.filter((item) => item.headers.referer === entry)
								: []
							).filter((item) => {
								const datetime = new Date(item.time);
								return (
									datetime.getDate() === date.getDate() &&
									datetime.getMonth() === date.getMonth() &&
									datetime.getFullYear() === date.getFullYear() &&
									(timeFrame === 'day'
										? datetime.getHours() === label
										: timeFrame === 'hour'
										? datetime.getHours() === date.getHours() &&
										  datetime.getMinutes() === label
										: datetime.getHours() === date.getHours() &&
										  datetime.getMinutes() === date.getMinutes() &&
										  datetime.getSeconds() === label)
								);
							}).length
					),
					borderColor: cbd,
					backgroundColor: cbg,
					borderWidth: 1,
				};
			}),
		},
		options: {
			scales: {
				x: {
					stacked: true,
				},
				y: {
					stacked: true,
					beginAtZero: true,
				},
			},
			onClick: (e) => {
				const target = CHART_INSTANCE.getElementsAtEventForMode(
					e as any,
					'nearest',
					{
						intersect: true,
					},
					true
				)[0];

				if (!target) {
					if (timeFrame === 'hour') return displayChart('day', date, filters, displayType);
					if (timeFrame === 'minute') return displayChart('hour', date, filters, displayType);
					return displayChart('day', date, filters, displayType);
				}

				const hms = labels[target.index];

				if (timeFrame === 'day') {
					const Ndate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hms);
					displayChart('hour', Ndate, filters, displayType);
				} else if (timeFrame === 'hour') {
					const Ndate = new Date(
						date.getFullYear(),
						date.getMonth(),
						date.getDate(),
						date.getHours(),
						hms
					);
					displayChart('minute', Ndate, filters, displayType);
				} else {
					const items = filteredData.filter((item) => {
						const datetime = new Date(item.time);
						return (
							datetime.getDate() === date.getDate() &&
							datetime.getMonth() === date.getMonth() &&
							datetime.getFullYear() === date.getFullYear() &&
							datetime.getHours() === date.getHours() &&
							datetime.getMinutes() === date.getMinutes() &&
							datetime.getSeconds() === hms
						);
					});

					inspect(items);
				}
			},
			plugins: {
				title: {
					text:
						timeFrame === 'day'
							? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
							: timeFrame === 'hour'
							? `${date.getDate()}.${
									date.getMonth() + 1
							  }.${date.getFullYear()} (${date.getHours()}:00 - ${date.getHours()}:59}`
							: `${date.getDate()}.${
									date.getMonth() + 1
							  }.${date.getFullYear()} (${date.getHours()}:${date.getMinutes()}:00 - ${date.getHours()}:${date.getMinutes()}:59})`,
					display: true,
					font: {
						size: 20,
						family: 'Roboto',
						weight: 'bold',
					},
				},
			},
		},
	});
}

async function getData(date: Date): Promise<AnalyticsData> {
	return new Promise((resolve, reject) => {
		fetch(`/admin/analytics/${date.toISOString().split('T')[0]}`)
			.then((res) => {
				return res.json();
			})
			.then((res) => {
				resolve(res);
			});
	});
}

function loadChart() {
	const filters = [];

	const onlyGermany = (document.getElementById('onlyGermany') as HTMLInputElement).checked;
	if (onlyGermany)
		filters.push({
			prop: 'geoip.country',
			value: 'Germany',
		});

	const dataType = (document.getElementById('dataType') as HTMLSelectElement).value;
	const date = (document.getElementById('date') as HTMLInputElement).valueAsDate;

	if (!date) (document.getElementById('date') as HTMLInputElement).valueAsDate = new Date();

	displayChart('day', date || new Date(), filters, dataType as any);
}

const colors = new Map<string, { r: number; g: number; b: number }>();

function getRandomColor(url: string) {
	if (!colors.has(url)) {
		const [r, g, b] = [
			Math.floor(Math.random() * 16) * 16,
			Math.floor(Math.random() * 16) * 16,
			Math.floor(Math.random() * 16) * 16,
		];
		colors.set(url, { r, g, b });
	}

	const { r, g, b } = colors.get(url);

	const cbg = `rgba(${r}, ${g}, ${b}, 0.5)`;
	const cbd = `rgba(${r}, ${g}, ${b}, 1)`;

	return { cbg, cbd };
}

function inspect(items: RouteAnalyticsData[]) {
	const wrapper = document.getElementById('jsonInspect') as HTMLDivElement;

	wrapper.innerHTML = '';

	function createJSONLayer(json: any, tabs: number = 1) {
		const jsonLayer = document.createElement('div');
		jsonLayer.classList.add('json-layer');

		for (const key in json) {
			const value = json[key];

			const label = document.createElement('div');
			label.classList.add('json-label');
			label.innerText = `${key}:`;

			const valueLayer = document.createElement('div');
			valueLayer.classList.add('json-value');
			valueLayer.style.paddingLeft = `${tabs * 20}px`;

			if (typeof value === 'object') {
				valueLayer.appendChild(createJSONLayer(value, tabs + 1));
				// dark-green
				valueLayer.style.color = '#006400';
			} else {
				valueLayer.innerText = value;
				// string = blue | number = red | boolean = pink
				valueLayer.style.color =
					typeof value === 'string'
						? '#0000ff'
						: typeof value === 'number'
						? '#ff0000'
						: '#ff00ff';
			}

			jsonLayer.appendChild(label);
			jsonLayer.appendChild(valueLayer);
		}

		return jsonLayer;
	}

	wrapper.appendChild(createJSONLayer(items));

	document.getElementById('jsonInspectParent').hidden = false;
}

document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		document.getElementById('jsonInspectParent').hidden = true;
	}
});

interface RouteAnalyticsData {
	ip: string;
	geoip: any;
	url: string;
	method: string;
	headers: any;
	body: any;
	query: any;
	time: string;
}

interface WSAnalyticsData {
	ip: string;
	geoip: any;
	time: string;
	disconnectTime?: string;
}

interface AnalyticsData {
	route: RouteAnalyticsData[];
	ws: WSAnalyticsData[];
	error?: string;
}
