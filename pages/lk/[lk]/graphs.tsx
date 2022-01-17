import DataFetcher from '../../../data/data';
import Inzidenz from '../../../components/charts/Inzidenz';
import Hospitalisierung from '../../../components/charts/Hospitalisierung';
import { DistrictData } from '../../../data/dayTableParser';

export default function Graphs({
	props,
}: {
	props: {
		data: {
			data: DistrictData;
			date: string;
		}[];
	};
}) {
	return (
		<div className="graphs">
			<div className="graphs__inzidenz">
				<Inzidenz data={props.data} />
			</div>
			<div className="graphs__hospitalisierung">
				<Hospitalisierung data={props.data} />
			</div>
			<style>
				{
					// Display both graphs next to each other
					'.graphs { display: grid; grid-template-columns: 1fr 1fr; }' +
						'.graphs__inzidenz { grid-column: 1 / 2; }' +
						'.graphs__hospitalisierung { grid-column: 2 / 3; }' +
						// If the screen size is less than 1200px, display the graphs in a single column
						'@media screen and (max-width: 1199px) {' +
						'.graphs { display: block; }' +
						'.graphs__inzidenz { margin-bottom: 1em; }' +
						'.graphs__hospitalisierung { margin-top: 1em; }' +
						'}'
				}
			</style>
		</div>
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
