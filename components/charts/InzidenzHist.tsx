import { Line } from 'react-chartjs-2';
import DataFetcher from '../../data/data';

export default function Chart(props) {
	const districtName = props.districtName;

	const dtf = DataFetcher.getInstance();
	const data = dtf.getTablesForDistrict(districtName);

	const inzidenzValues = data.map((row) => {
		return row.data.siebenTage.Inzidenz;
	});

	return (
		<Line
			data={{
				labels: data.map((row) => {
					return row.date;
				}),
				datasets: [
					{
						label: 'Inzidenz',
						data: inzidenzValues.map((row) => {
							return row.RLP;
						}),
						backgroundColor: 'rgba(255, 99, 132, 0.2)',
						borderColor: 'rgba(255, 99, 132, 1)',
						borderWidth: 1,
					},
				],
			}}
		/>
	);
}

export interface ChartProps {
	districtName: string;
}
