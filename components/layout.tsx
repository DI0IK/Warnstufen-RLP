import Link from 'next/link';

export default function Layout({ children }) {
	return (
		<div className="layout-item">
			{children}
			<footer>
				<Link href="/">
					<a>Zurück zur Landkreis Auswahl</a>
				</Link>
				<Link href="/docs">
					<a>API Dokumentation</a>
				</Link>
				<Link href="/kontakt">
					<a>Kontakt/Datenschutz</a>
				</Link>
				<Link href="/coronaverordnung">
					<a>Coronaverordnung</a>
				</Link>
			</footer>
		</div>
	);
}
