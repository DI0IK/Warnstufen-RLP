export default function Layout({ children }) {
	if (process.env.WARTUNG === 'true') {
		return (
			<div className="layout">
				<header></header>
				<main>
					<h1>Wartungsarbeiten</h1>
					<p>
						Wir arbeiten gerade an der Seite. Dies kann einige Minuten bis zu wenigen Tagen
						dauern.
					</p>
				</main>
				<footer></footer>
			</div>
		);
	}
	return (
		<div className="layout">
			<header></header>
			<main>{children}</main>
			<footer></footer>
		</div>
	);
}
