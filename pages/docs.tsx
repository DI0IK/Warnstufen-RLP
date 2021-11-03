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
				</ul>
				<br />
			</div>
		</Layout>
	);
}
