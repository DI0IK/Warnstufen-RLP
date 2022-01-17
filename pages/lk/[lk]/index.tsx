import Layout from '../../../components/layout';
import DataFetcher from '../../../data/data';
import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import Link from 'next/link';

export default function LK() {
	const router = useRouter();
	const { lk } = router.query as { lk: string };

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
			<br />
			<h3>
				<Link href={`/lk/${lk}/table`}>
					<a>Tabellen Ansicht</a>
				</Link>
			</h3>
			<div className="iframe-wrapper">
				<iframe src={`/lk/${lk}/graphs`} id={'Graphs'}></iframe>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	return {
		props: {},
	};
}
