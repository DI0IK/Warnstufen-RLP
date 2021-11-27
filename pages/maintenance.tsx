import Layout from '../components/layout';

export default function Maintenance() {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100vh',
			}}
		>
			<h1>Wartungsarbeiten</h1>
			<h2>
				Wir arbeiten gerade an der Seite. Dies kann einige Stunden bis zu wenigen Tagen dauern.
			</h2>
		</div>
	);
}
