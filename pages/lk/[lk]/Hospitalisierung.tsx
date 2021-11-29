import DataFetcher from '../../../data/data';
import { Chart, ChartProps } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	BubbleController,
	DoughnutController,
	LineController,
	PieController,
	PolarAreaController,
	RadarController,
	ScatterController,
	CategoryScale,
	LinearScale,
	LogarithmicScale,
	RadialLinearScale,
	TimeScale,
	TimeSeriesScale,
	Decimation,
	Filler,
	Legend,
	Title,
	Tooltip,
	SubTitle,
} from 'chart.js';
import { DistrictData } from '../../../data/dayTableParser';

ChartJS.register(
	ArcElement,
	LineElement,
	BarElement,
	PointElement,
	BarController,
	BubbleController,
	DoughnutController,
	LineController,
	PieController,
	PolarAreaController,
	RadarController,
	ScatterController,
	CategoryScale,
	LinearScale,
	LogarithmicScale,
	RadialLinearScale,
	TimeScale,
	TimeSeriesScale,
	Decimation,
	Filler,
	Legend,
	Title,
	Tooltip,
	SubTitle
);

export default function Hospitalisierung({
	props,
}: {
	props: {
		data: {
			data: DistrictData;
			date: string;
		}[];
	};
}) {
	const options: ChartProps<'line', number[], string>['options'] = {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};
	return (
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
			options={options}
		/>
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
