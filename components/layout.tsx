import Link from 'next/link';

export default function Layout({ children }) {
	return (
		<div className="layout-item">
			{children}
			<header>
				<Link href="/">
					<a>Zurück zur Landkreis Auswahl</a>
				</Link>
				<Link href="/docs">
					<a>API Dokumentation</a>
				</Link>
				<Link href="/kontakt">
					<a>Kontakt/Datenschutz</a>
				</Link>
				<Link href="/coronaverordnungen">
					<a>Coronaverordnungen</a>
				</Link>
				<div>
					Angaben ohne Gewähr. Datenquellen:{' '}
					<Link href="https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Listen/Leitindikatoren_Corona-Warnstufen.xlsx">
						<a>LUA Rheinland-Pfalz</a>
					</Link>
				</div>
			</header>
		</div>
	);
}
