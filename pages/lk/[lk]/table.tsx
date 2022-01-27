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
							<th colSpan={2} scope="colgroup">
								Neue Fälle
							</th>
							<th colSpan={6} scope="colgroup">
								Inzidenz der letzten 7-Tage pro 100.000
							</th>
						</tr>
						<tr>
							<th scope="col">Gesamt</th>
							<th scope="col">Differenz zum Vortag</th>
							<th scope="col">Hospitalisiert</th>
							<th scope="col">Verstorben</th>
							<th scope="col">Genesen</th>
							<th scope="col">aktuelle Fälle</th>
							<th scope="col">Letzte 7 Tage</th>
							<th scope="col">Gleicher Zeitraum Vorwoche</th>
							<th scope="col">RLP</th>
							<th scope="col">RLP + USAF</th>
							<th scope="col">&lt;20 Jahre</th>
							<th scope="col">20-59 Jahre</th>
							<th scope="col">≥60 Jahre</th>
							<th scope="col">Hospitalisierungsinzidenz RLP</th>
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
									<td>{dateItem.data.neueFaelle.letzte7Tage}</td>
									<td>{dateItem.data.neueFaelle.vor7Tagenletzte7Tage || ''}</td>
									<td>{dateItem.data.inzidenz.RLP}</td>
									<td>{dateItem.data.inzidenz.RLPundUSAF}</td>
									<td>{dateItem.data.inzidenz.lt20y}</td>
									<td>{dateItem.data.inzidenz.lt60y}</td>
									<td>{dateItem.data.inzidenz.gt60y}</td>
									<td>{dateItem.data.inzidenz.IntensivHospitalisierungRLP || ''}</td>
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
