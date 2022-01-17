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
			<h2>Wir arbeiten gerade an der Website. Bitte haben Sie einen Moment Geduld.</h2>
		</div>
	);
}
