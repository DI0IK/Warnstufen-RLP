import Head from 'next/head';
import Link from 'next/link';
import { getAllLk, getLkData } from '../../lib/lk';
import Layout from '../../components/layout';
import { APIRawData } from '../../sheetReader/definitions/data';
import tableStyles from '../../styles/table.module.scss';
import styles from '../../styles/coronaverordnung.module.scss';
import { APIDistrict } from '../../sheetReader/definitions/districts';

export default function Lk({ lk, id }) {
	return (
		<Layout>
			<Head>
				<title>Warnstufe {id}</title>
				<meta
					name="description"
					content={'Warnstufe vom ' + new Date().toLocaleDateString('de-DE') + ' für ' + id}
				/>
				<meta
					name="keywords"
					content={
						'warnstufe, warnstufe ' +
						id +
						', coronavirus, coronavirus ' +
						id +
						', ' +
						id +
						' coronavirus, ' +
						id +
						' warnstufe'
					}
				/>

				<meta property="og:title" content={'Warnstufe ' + id} />
				<meta
					property="og:description"
					content={'Warnstufe vom ' + new Date().toLocaleDateString('de-DE') + ' für ' + id}
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content={'https://warnstufe.de/' + id} />
				<meta property="og:image" content={'/api/image/' + id.replace(/ /g, '_')} />

				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content={'Warnstufe ' + id} />
				<meta
					name="twitter:description"
					content={'Warnstufe vom ' + new Date().toLocaleDateString('de-DE') + ' für ' + id}
				/>
				<meta name="twitter:image" content={'/api/image/' + id.replace(/ /g, '_')} />
			</Head>
			<h1>Warnstufe {id}</h1>
			<div className={tableStyles.table}>
				<table>
					<tr>
						<th>Datum</th>
						<th>Inzidenz letzte 7 Tage pro 100.000 Einwohner</th>
						<th>Hospitalisierung letzte 7 Tage pro 100.000 Einwohner</th>
						<th>Intensivbetten belegt in Prozent</th>
						<th>
							<Link href="/coronaverordnung">
								<a className={styles.link}>Warnstufe</a>
							</Link>
						</th>
					</tr>
					{Object.keys(lk).map((key) => {
						const data = lk[key] as APIRawData;
						return (
							<tr key={key}>
								<td>{key}</td>
								<td>{data.Inzidenz7Tage}</td>
								<td>{data.Hospitalisierung7Tage}</td>
								<td>{data.IntensivbettenProzent}</td>
								<td className={'ws-' + data.Warnstufe}>
									<Link href="/coronaverordnung">
										<a className={styles.link}>{data.Warnstufe}</a>
									</Link>
								</td>
							</tr>
						);
					})}
				</table>
			</div>
		</Layout>
	);
}

export async function getServerSideProps({ params, res }) {
	if (!APIDistrict.includes(params.id.replace(/_/g, ' ')))
		return { props: { id: 'Landkreis Nicht Gefunden', lk: {} } };
	const lk = await getLkData(params.id.replace(/_/g, ' '));
	let newerThan7Days = {};
	for (let key in lk) {
		const data = lk[key] as APIRawData;
		const date = new Date(
			Number.parseInt(key.split('.')[2]),
			Number.parseInt(key.split('.')[1]) - 1,
			Number.parseInt(key.split('.')[0])
		);

		if (date > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
			newerThan7Days[key] = data;
		}
	}
	return {
		props: {
			id: params.id.replace(/_/g, ' '),
			lk: newerThan7Days,
		},
	};
}
