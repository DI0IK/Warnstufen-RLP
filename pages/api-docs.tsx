import Head from 'next/head';
import Layout from '../components/layout';
import DataFetcher from '../data/data';

export default function ApiDocs(data) {
	return (
		<Layout>
			<Head>
				<title>API Docs</title>
				<meta name="description" content="API Docs" />
				<meta
					name="keywords"
					content="API Docs Corona, API Docs Corona Virus, API Corona, Corona API, COVID-19 API, COVID-19 API Docs, COVID-19 API Corona Virus"
				/>
			</Head>
			<h1>API Docs</h1>
			<h2>Routes</h2>
			<div>
				<div>
					<h3>/api/districts</h3>
					<h4>Returns a list of all districts.</h4>
				</div>
				<div>
					<h3>/api/[district]</h3>
					<h4>Returns all Data for the district.</h4>
				</div>
				<div>
					<h3>/api/[district]/today</h3>
					<h4>Returns the Data for the district for today.</h4>
				</div>
				<div>
					<h3>/api/today</h3>
					<h4>Returns the Data for all districts for today.</h4>
				</div>
			</div>
			<h2>Examples</h2>
			<div>
				<h3>/api/districts</h3>
				<pre>
					<code>{JSON.stringify(data.districts, null, 2)}</code>
				</pre>
			</div>
			<div>
				<h3>/api/Rheinland-Pfalz</h3>
				<pre>
					<code>{JSON.stringify(data.RLPData, null, 2)}</code>
				</pre>
			</div>
			<div>
				<h3>/api/Rheinland-Pfalz/today</h3>
				<pre>
					<code>{JSON.stringify(data.TodayData['Rheinland-Pfalz'], null, 2)}</code>
				</pre>
			</div>
			<div>
				<h3>/api/today</h3>
				<pre>
					<code>{JSON.stringify(data.TodayData, null, 2)}</code>
				</pre>
			</div>
		</Layout>
	);
}

export async function getServerSideProps() {
	const prom = new Promise<DataFetcher>((resolve, reject) => {
		const data = DataFetcher.getInstance();

		const interv = setInterval(() => {
			if (data.isReady) {
				clearInterval(interv);
				resolve(data);
			}
		}, 100);
	});

	const fetcher = await prom;

	return {
		props: {
			districts: fetcher.getDistricts(),
			RLPData: fetcher.getTablesForDistrict('Rheinland-Pfalz'),
			TodayData:
				fetcher.getDayTableForToday() ||
				fetcher.getDayTable(new Date(Date.now() - 24 * 60 * 60 * 1000)),
		},
	};
}
