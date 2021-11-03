import Layout from '../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/coronaverordnung.module.scss';

export default function Coronaverordnung() {
	return (
		<Layout>
			<Head>
				<title>Coronaverordnungen</title>
			</Head>
			<h1>Coronaverordnungen</h1>
			<div id="warnstufen">
				<table className={styles.table}>
					<tr>
						<th>Leitindikator</th>
						<th className="ws-1">Warnstufe 1</th>
						<th className="ws-2">Warnstufe 2</th>
						<th className="ws-3">Warnstufe 3</th>
					</tr>
					<tr>
						<td>7 Tage Inzidenz</td>
						<td className="ws-1">bis höchstens 100</td>
						<td className="ws-2">über 100 bis 200</td>
						<td className="ws-3">mehr als 200</td>
					</tr>
					<tr>
						<td>7 Tage Hospitalisierungs Inzidenz</td>
						<td className="ws-1">kleiner 5</td>
						<td className="ws-2">5 bis 10</td>
						<td className="ws-3">größer 10</td>
					</tr>
					<tr>
						<td>Anteil Intensivbetten</td>
						<td className="ws-1">bis höchstens 6%</td>
						<td className="ws-2">mehr als 6% bis 12%</td>
						<td className="ws-3">mehr als 12%</td>
					</tr>
				</table>
				<span>
					Weiter Informationen:
					<br />
					<Link href="https://corona.rlp.de/de/aktuelles/detail/news/News/detail/ministerpraesidentin-malu-dreyergesundheitsminister-clemens-hoch-mehr-schutz-fuer-alten-und-pfleghe/">
						<a className={styles.link}>27. Corona-Bekämpfungsverordnung</a>
					</Link>
					<br />
					<br />
					<div>
						<Link href="https://corona.rlp.de/fileadmin/rlp-stk/pdf-Dateien/Corona/26._CoBeLVO/210908_26_CoBeLVO.pdf">
							<a className={styles.link}>26. Corona-Bekämpfungsverordnung</a>
						</Link>
						<br />
						<Link href="https://corona.rlp.de/fileadmin/rlp-stk/pdf-Dateien/Corona/26._CoBeLVO/210921_26_CoBeLVO_1_AEndVO_001.pdf">
							<a className={styles.link}>
								Erste Landesverordung zur Änderung der 26. Corona-Bekämpfungsverordnung
								(21.09.2021)
							</a>
						</Link>
						<br />
						<Link href="https://corona.rlp.de/fileadmin/corona/Verordnungen/AEnderung_26.CoBeVo/211008_26_CoBeLVO_2_AEndVO.pdf">
							<a className={styles.link}>
								Zweite Landesverordung zur Änderung der 26. Corona-Bekämpfungsverordnung
								(08.10.2021)
							</a>
						</Link>
					</div>
					<br />
					<Link href="https://corona.rlp.de/de/aktuelles/corona-regeln-im-ueberblick/">
						<a className={styles.link}>Überblick</a>
					</Link>
				</span>
			</div>
		</Layout>
	);
}
