import Link from 'next/link';
import Warning from './warning';

export default function Layout({ children }) {
	return (
		<div className="layout-item">
			<Warning />
			{children}
			<header>
				<button className="menuButton"></button>
				<div className="menuEntry">
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
					<Link href="https://lua.rlp.de/fileadmin/lua/Downloads/Corona/Listen/Leitindikatoren_Corona-Warnstufen.xlsx">
						<a>Datenquelle</a>
					</Link>
					<Link href="https://github.com/DI0IK/Warnstufen-RLP">
						<a>Github</a>
					</Link>
					<button
						onClick={() => {
							document.querySelector('html')!.classList.toggle('dark');
						}}
					>
						Design umschalten
					</button>
				</div>
			</header>
		</div>
	);
}
