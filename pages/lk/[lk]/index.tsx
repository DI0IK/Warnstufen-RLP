import Layout from '../../../components/layout';
import DataFetcher from '../../../data/data';
import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import Link from 'next/link';

export default function LK() {
	const router = useRouter();
	const { lk } = router.query as { lk: string };

	React.useEffect(() => {
		//@ts-ignore
		typeof load === 'function'
			? //@ts-ignore
			  load()
			: (() => {
					const script = document.createElement('script');
					script.src = '/scripts/lk.iframes.js';
					document.body.appendChild(script);
			  })();
	});

	return (
		<Layout>
			<Head>
				<title>Warnzahlen {lk.replace(/_/g, ' ')}</title>
				<meta name="description" content={'Warnzahlen ' + lk} />
				<meta
					name="keywords"
					content={`Warnzahl,Warnzahlen,Inzidenz,Hospitalisierung,${lk},Warnzahl ${lk}, ${lk} Warnzahlen, Inzidenz ${lk}, Hospitalisierung ${lk}, ${lk} Inzidenz, ${lk} Hospitalisierung`}
				/>
				<meta name="robots" content="index, follow" />
				<meta name="og:title" content={'Warnzahlen ' + lk} />
				<meta name="og:description" content={'Warnzahlen für ' + lk} />
			</Head>
			<h1>{(lk as string).replace(/_/g, ' ')}</h1>
			<div>
				<h3
					onClick={(e) => {
						e.currentTarget.parentElement
							.getElementsByClassName('order')[0]
							.classList.toggle('collapsed');
						e.currentTarget.classList.toggle('collapsed');
					}}
				>
					Positionen der Diagramme bearbeiten
					<br />
					(Klicken zum Ein-/Ausblenden)
				</h3>
				<div className={'order collapsed'}></div>
			</div>
			<h3>
				<Link href={`/lk/${lk}/table`}>
					<a>Tabellen Version</a>
				</Link>
			</h3>
			<div id={'pre-js-wrapper'} className={'iframe-wrapper'}>
				<iframe src={`/lk/${lk}/Inzidenz`} id={'Inzidenz'}></iframe>
				<iframe src={`/lk/${lk}/Hospitalisierung`} id={'Hospitalisierung'}></iframe>
				<iframe src={`/lk/${lk}/MomentanErkrankt`} id={'MomentanErkrankt'}></iframe>
			</div>
			<div id={'iframes'} className={'iframe-wrapper'}></div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const prom = new Promise((resolve, reject) => {
		const data = DataFetcher.getInstance();

		const interv = setInterval(() => {
			if (data.isReady) {
				clearInterval(interv);
				resolve({
					props: {
						data: data
							.getTablesForDistrict(context.params.lk.replace(/_/g, ' '))
							.filter((entry) => {
								// only display last 3 weeks
								const date = new Date(entry.date.split('.').reverse().join('-'));
								const now = new Date();
								return date.getTime() > now.getTime() - 3 * 7 * 24 * 60 * 60 * 1000;
							}),
					},
				});
			}
		}, 100);
	});

	return { props: await prom };
}
