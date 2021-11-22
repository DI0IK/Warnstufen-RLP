import Head from 'next/head';
import Link from 'next/link';
import { getAllLk, getLkData } from '../lib/lk';
import linkList from '../styles/linkList.module.scss';
import indexPage from '../styles/index.module.scss';
import { APIRawData } from '../sheetReader/definitions/data';
import Warning from '../components/warning';

export default function Home({ lk }) {
	return (
		<div className="main-page">
			<Head>
				<title>Warnstufen Rheinland Pfalz</title>
				<meta name="description" content="Warnstufen Rheinland Pfalz" />
				<meta
					name="keywords"
					content="Warnstufen, Warnstufe, Rheinland Pfalz, Warnstufen Rheinland Pfalz, Warnstufen RLP, Warnstufe Rheinland Pfalz, Warnstufe RLP"
				/>
				<meta name="og:title" content="Warnstufen Rheinland Pfalz" />
				<meta
					name="og:description"
					content="Warnstufen der Landkreise und Kreisstädte Rheinland-Pfalz"
				/>
				<meta name="twitter:title" content="Warnstufen Rheinland Pfalz" />
				<meta
					name="twitter:description"
					content="Warnstufen der Landkreise und Kreisstädte Rheinland-Pfalz"
				/>
				<meta name="og:type" content="website" />
				<meta name="twitter:card" content="summary" />
				<link rel="icon" href="/favicon.ico" />

				<script
					dangerouslySetInnerHTML={{
						__html: `if(location.hash.length) {
							const hash = location.hash.substr(1);
							// redirect to /lk/<hash>
							location.href = '/lk/' + hash;
						}`,
					}}
				/>
			</Head>

			<main>
				<Warning />
				<h1>Warnstufen Rheinland Pfalz</h1>
				<div className={linkList.linkList}>
					{getAllLk()
						.sort((a, b) => {
							if (
								a.params.id.replace('KS ', '').replace(/ /g, '_') >
								b.params.id.replace('KS ', '').replace(/ /g, '_')
							)
								return 1;
							if (
								a.params.id.replace('KS ', '').replace(/ /g, '_') <
								b.params.id.replace('KS ', '').replace(/ /g, '_')
							)
								return -1;
							return 0;
						})
						.filter(({ params }, i, a) => {
							const ma = a.map(({ params }) => params.id);
							return ma.indexOf(params.id) === i;
						})
						.map(({ params }) => {
							const date = new Date().toLocaleDateString('de-DE', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
							});
							const dateYesterday = new Date(
								new Date().getTime() - 24 * 60 * 60 * 1000
							).toLocaleDateString('de-DE', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
							});

							const data = (
								lk[params.id][date]?.Inzidenz7Tage
									? lk[params.id][date]
									: lk[params.id][dateYesterday]
							) as APIRawData;

							return (
								<div key={params.id}>
									<Link href="/lk/[id]" as={`/lk/${params.id.replace(/ /g, '_')}`}>
										<a className={'ws-' + data?.Warnstufe + ' hoverable'}>{params.id}</a>
									</Link>
									<span className="ws-hover">
										<span>Inzidenz: {data.Inzidenz7Tage}</span>
										<span>Hospitalisierung: {data.Hospitalisierung7Tage}</span>
										<span>Intensivbetten: {data.IntensivbettenProzent}%</span>
									</span>
								</div>
							);
						})}
				</div>
				<div>
					<h2>Legende:</h2>
					<ul className={indexPage.wslist}>
						<li className="ws-1">
							<span className="ws-1">Warnstufe 1</span>
						</li>
						<li className="ws-2">
							<span className="ws-2">Warnstufe 2</span>
						</li>
						<li className="ws-3">
							<span className="ws-3">Warnstufe 3</span>
						</li>
					</ul>
				</div>
			</main>

			<header>
				<button className="menuButton"></button>
				<div className="menuEntry">
					<Link href="/docs">
						<a>API-Dokumentation</a>
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

export async function getServerSideProps() {
	const lk = await getLkData();
	return {
		props: {
			lk,
		},
	};
}
