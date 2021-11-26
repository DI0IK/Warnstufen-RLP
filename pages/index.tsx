import Layout from '../components/layout';
import DataFetcher from '../data/data';
import Link from 'next/link';
import lkListStyles from '../styles/lkList.module.scss';

export default function Index({ props }) {
	return (
		<Layout>
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
