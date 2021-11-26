import Layout from '../../components/layout';
import DataFetcher from '../../data/data';
import { Chart } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { DistrictData } from '../../data/dayTableParser';
import { useRouter } from 'next/router';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ({
	props,
}: {
	props: {
		data: {
			data: DistrictData;
			date: string;
		}[];
	};
}) {
	const router = useRouter();
	const { lk } = router.query;
	return (
		<Layout>
			<h1>{(lk as string).replace(/_/g, ' ')}</h1>
			<div className={'lk-inzidenz-rlp-hist'}>
				<h2>7 Tage Inzidenzen:</h2>
				<h3>{props.data[0].data.siebenTage.Inzidenz.RLP}</h3>
				<Chart
					type="line"
					data={{
						datasets: [
							{
								data: props.data.map((entry) => entry.data.siebenTage.Inzidenz.RLP),
								label: 'Inzidenz Alle',
								borderColor: '#ff0000',
								backgroundColor: '#ff0000',
								fill: false,
							},
							{
								data: props.data.map((entry) => entry.data.siebenTage.Inzidenz.gt60y),
								label: 'Inzidenz über 60 jahre',
								borderColor: '#00ff00',
								backgroundColor: '#00ff00',
								fill: false,
							},
							{
								data: props.data.map((entry) => entry.data.siebenTage.Inzidenz.lt60y),
								label: 'Inzidenz zwischen 20 und 60 jahre',
								borderColor: '#0000ff',
								backgroundColor: '#0000ff',
								fill: false,
							},
							{
								data: props.data.map((entry) => entry.data.siebenTage.Inzidenz.lt20y),
								label: 'Inzidenz unter 20 jahre',
								borderColor: '#ff00ff',
								backgroundColor: '#ff00ff',
								fill: false,
							},
						],
						labels: props.data.map((entry) => entry.date),
					}}
					width={800}
					height={400}
				/>
			</div>
			<div className={'rlp-intensiv-hospitalisierung'}>
				<h2>Hospitalisierung:</h2>
				<h3>{props.data.slice().reverse()[0].data.siebenTage.IntensivHospitalisierungRLP}</h3>
				<Chart
					type="line"
					data={{
						datasets: [
							{
								data: props.data
									.filter((entry) => entry.data.siebenTage.IntensivHospitalisierungRLP)
									.map((entry) => entry.data.siebenTage.IntensivHospitalisierungRLP),
								label: 'Hospitalisierung',
								borderColor: '#ff0000',
								backgroundColor: '#ff0000',
								fill: false,
							},
						],
						labels: props.data
							.filter((entry) => entry.data.siebenTage.IntensivHospitalisierungRLP)
							.map((entry) => entry.date),
					}}
					width={800}
					height={400}
				/>
			</div>
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
						data: data.getTablesForDistrict(context.params.lk.replace(/_/g, ' ')),
					},
				});
			}
		}, 100);
	});

	return {
		props: await prom,
	};
}
