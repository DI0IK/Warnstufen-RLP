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
