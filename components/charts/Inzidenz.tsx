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

export default function Inzidenz({
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
					Inzidenz: <span>{data[data.length - 1].data.inzidenz.RLP}</span>
				</h2>
			</div>
			<Chart
				type="line"
				data={{
					datasets: [
						{
							data: data.map((entry) => entry.data.inzidenz.RLP),
							label: 'Alle',
							borderColor: '#ff0000',
							backgroundColor: '#ff0000',
							fill: false,
						},
						{
							data: data.map((entry) => entry.data.inzidenz.gt60y),
							label: 'über 60 jahre',
							borderColor: '#00ff00',
							backgroundColor: '#00ff00',
							fill: false,
						},
						{
							data: data.map((entry) => entry.data.inzidenz.lt60y),
							label: 'zwischen 20 und 60 jahre',
							borderColor: '#0000ff',
							backgroundColor: '#0000ff',
							fill: false,
						},
						{
							data: data.map((entry) => entry.data.inzidenz.lt20y),
							label: 'unter 20 jahre',
							borderColor: '#ff00ff',
							backgroundColor: '#ff00ff',
							fill: false,
						},
					],
					labels: data.map((entry) => entry.date),
				}}
				options={options}
			/>
		</div>
	);
}
