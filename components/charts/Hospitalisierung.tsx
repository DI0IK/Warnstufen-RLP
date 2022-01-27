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
import { DistrictData } from '../../data/dayTableParser';

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
	data,
}: {
	data: {
		data: DistrictData;
		date: string;
	}[];
}) {
	const options: ChartProps<'line', number[], string>['options'] = {
		scales: {
			y: {
				beginAtZero: true,
			},
		},
		aspectRatio: 1.5,
		responsive: true,
	};
	return (
		<div>
			<div>
				<h2>
					Hospitalisierung:{' '}
					<span>{data[data.length - 1].data.inzidenz.IntensivHospitalisierungRLP}</span>
				</h2>
			</div>
			<Chart
				type="line"
				data={{
					datasets: [
						{
							data: data
								.filter((entry) => entry.data.inzidenz.IntensivHospitalisierungRLP)
								.map((entry) => entry.data.inzidenz.IntensivHospitalisierungRLP),
							label: 'Hospitalisierung',
							borderColor: '#ff0000',
							backgroundColor: '#ff0000',
							fill: false,
						},
					],
					labels: data
						.filter((entry) => entry.data.inzidenz.IntensivHospitalisierungRLP)
						.map((entry) => entry.date),
				}}
				options={options}
			/>
		</div>
	);
}
