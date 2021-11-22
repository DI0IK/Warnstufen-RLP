import Head from 'next/head';
import { APIDistrict } from '../sheetReader/definitions/districts';
import Layout from '../components/layout';
import Link from 'next/link';

export default function Docs() {
	return (
		<Layout>
			<Head>
				<title>Dokumentation</title>
				<meta name="description" content="Dokumentation zu den API Routen" />
			</Head>
			<h1>Dokumentation</h1>
			<div>
				<h2>API Routen</h2>
				<ul>
					<li>
						<Link href="/api/districts">
							<a>/api/v2/districts</a>
						</Link>
						<div>
							Response:
							<pre>
								<code>{JSON.stringify(APIDistrict, null, 2)}</code>
							</pre>
						</div>
					</li>
					<li>
						<Link href="/api/data">
							<a>/api/v2/data</a>
						</Link>
						<div>
							Response:
							<pre>
								<code>
									{JSON.stringify(
										{
											'**district**': {
												'**date**': {
													Inzidenz7Tage: 'number',
													Hospitalisierung7Tage: 'number',
													IntensivbettenProzent: 'number',
													Warnstufe: '1|2|3',
												},
											},
										},
										null,
										2
									)}
								</code>
							</pre>
						</div>
					</li>
					<li>
						<Link href="/api/image/[district]">
							<a>/api/image/[district]</a>
						</Link>
						<div>
<<<<<<< Updated upstream
							Example:
							<pre>
								<code>
									&lt;img
									src=&quot;https://www.warnzahl-rlp.de/api/image/Westerwaldkreis&quot;
									width=&quot;600&quot; height=&quot;300&quot; /&gt;
								</code>
							</pre>
							<img
								src="https://www.warnzahl-rlp.de/api/image/KS_Landau_i.d.Pf."
								width={600}
								height={300}
							/>
=======
							Response example:
							<div>
<<<<<<< HEAD
								<pre>
									<code>
										&lt;img src="/api/image/KS_Landau_i.d.Pf." alt="LK Landau i.d.Pf."
										/&gt;
									</code>
								</pre>
								<Image src="/api/image/KS_Landau_i.d.Pf." alt="LK Landau i.d.Pf." />
=======
								src="/api/image/KS_Landau_i.d.Pf."
								<br />
								<img src="/api/image/KS_Landau_i.d.Pf." alt="LK Landau i.d.Pf." />
>>>>>>> 1d3799fbf1d118858b409b13ff5b74ef34896e7a
							</div>
>>>>>>> Stashed changes
						</div>
					</li>
				</ul>
				<br />
			</div>
		</Layout>
	);
}
