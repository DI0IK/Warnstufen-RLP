import Layout from '../components/layout';
import DataFetcher from '../data/data';
import Link from 'next/link';
import lkListStyles from '../styles/lkList.module.scss';
import Head from 'next/head';

export default function Index({ props }) {
	return (
		<Layout>
			<Head>
				<title>Warnzahlen RLP</title>
				<meta name="description" content="Warnzahlen für alle Landkreise in RLP" />
				<meta name="keywords" content="Warnzahlen RLP" />
				<meta name="robots" content="index, follow" />
				<meta name="og:title" content="Warnzahlen RLP" />
				<meta name="og:description" content="Warnzahlen für alle Landkreise in RLP" />
			</Head>
			<h1>Warnzahlen RLP</h1>
			<div>
				<h2>Landkreise:</h2>
				<div className={lkListStyles.list}>
					<ul>
						{props.data
							.sort((a, b) => {
								if (a.replace('KS ', '') > b.replace('KS ', '')) return 1;
								if (a.replace('KS ', '') < b.replace('KS ', '')) return -1;
								return 0;
							})
							.map((item, index) => {
								return (
									<li key={index}>
										<Link href={`/lk/${item.replace(/ /g, '_')}`}>
											<a>{item}</a>
										</Link>
									</li>
								);
							})}
					</ul>
				</div>
			</div>
		</Layout>
	);
}

export async function getServerSideProps() {
	const prom = new Promise((resolve, reject) => {
		const data = DataFetcher.getInstance();

		const interv = setInterval(() => {
			if (data.isReady) {
				clearInterval(interv);
				resolve({
					props: {
						data: data.getDistricts(),
					},
				});
			}
		}, 100);
	});

	return {
		props: await prom,
	};
}
