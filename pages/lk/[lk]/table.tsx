import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/layout';
import DataFetcher from '../../../data/data';
import { DistrictData } from '../../../data/dayTableParser';
import tableStyle from '../../../styles/table.module.scss';

export default function Table({
	data,
}: {
	data: {
		data: DistrictData;
		date: string;
	}[];
}) {
	const router = useRouter();
	const { lk, date } = router.query as {
		lk: string;
		date: string;
	};

	return (
		<Layout>
			<Head>
				<title>
					Tabelle {lk.replace(/_/g, ' ')} {date}
				</title>
			</Head>
			<div className={tableStyle.tableWrapper}>
				<table>
					<col />
					<col />
					<colgroup span={6}></colgroup>
					<colgroup span={7}></colgroup>
					<colgroup span={5}></colgroup>
					<thead>
						<tr>
							<th rowSpan={3} className={tableStyle.sticky}>
								Datum
							</th>
							<th rowSpan={3}>Wochentag</th>
							<th colSpan={6} scope="colgroup">
								Laborbestätigt, seit Beginn der Pandemie
							</th>
							<th colSpan={7} scope="colgroup">
								Gemeldet, die letzten 7 Tage
							</th>
						</tr>
						<tr>
							<th scope="col" rowSpan={2}>
								Gesamt
							</th>
							<th scope="col" rowSpan={2}>
								Differenz zum Vortag
							</th>
							<th scope="col" rowSpan={2}>
								Hospitalisiert
							</th>
							<th scope="col" rowSpan={2}>
								Verstorben
							</th>
							<th scope="col" rowSpan={2}>
								Genesen
							</th>
							<th scope="col" rowSpan={2}>
								aktuelle Fälle
							</th>
							<th scope="col" rowSpan={2}>
								Gesamt
							</th>
							<th scope="colgroup" colSpan={5}>
								Inzidenz pro 100.000
							</th>
							<th scope="col" rowSpan={2}>
								Hospitalisierungsinzidenz RLP
							</th>
						</tr>
						<tr>
							<th scope="col">RLP</th>
							<th scope="col">RLP + USAF</th>
							<th scope="col">&lt;20 Jahre</th>
							<th scope="col">20-59 Jahre</th>
							<th scope="col">≥60 Jahre</th>
						</tr>
					</thead>
					<tbody>
						{data.map((dateItem) => {
							return (
								<tr key={dateItem.date}>
									<th scope="row" className={tableStyle.pinnedColumn}>
										{dateItem.date}
									</th>
									<th scope="row">
										{new Date(
											dateItem.date.split('.').reverse().join('-')
										).toLocaleDateString('de-DE', {
											weekday: 'long',
										})}
									</th>
									<td>{dateItem.data.seitBeginn.Gesamt}</td>
									<td>{dateItem.data.seitBeginn.Diff}</td>
									<td>{dateItem.data.seitBeginn.Hospitalisierung}</td>
									<td>{dateItem.data.seitBeginn.Verstorben}</td>
									<td>{dateItem.data.seitBeginn.Genesen}</td>
									<td>{dateItem.data.seitBeginn.aktuelleFaelle}</td>
									<td>{dateItem.data.siebenTage.Gesamt}</td>
									<td>{dateItem.data.siebenTage.Inzidenz.RLP}</td>
									<td>{dateItem.data.siebenTage.Inzidenz.RLPundUSAF}</td>
									<td>{dateItem.data.siebenTage.Inzidenz.lt20y}</td>
									<td>{dateItem.data.siebenTage.Inzidenz.lt60y}</td>
									<td>{dateItem.data.siebenTage.Inzidenz.gt60y}</td>
									<td>{dateItem.data.siebenTage.IntensivHospitalisierungRLP}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Layout>
	);
}

export async function getServerSideProps(context) {
	const { lk } = context.query;

	const dates = new Promise<
		{
			data: DistrictData;
			date: string;
		}[]
	>((resolve, reject) => {
		const data = DataFetcher.getInstance();

		const interv = setInterval(() => {
			if (data.isReady) {
				clearInterval(interv);
				resolve(data.getTablesForDistrict(lk.replace(/_/g, ' ')));
			}
		}, 100);
	});

	return {
		props: {
			data: (await dates).reverse(),
		},
	};
}
