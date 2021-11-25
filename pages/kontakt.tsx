import Head from 'next/head';
import Layout from '../components/layout';
import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export default function Kontakt({ kontakt }) {
	return (
		<Layout>
			<Head>
				<title>Kontakt</title>
				<meta name="robots" content="noindex" />
			</Head>
			<h1>Kontakt und Datenschutzerklärung</h1>
			<div dangerouslySetInnerHTML={{ __html: kontakt }} />
		</Layout>
	);
}

export async function getStaticProps() {
	if (fs.existsSync(path.resolve(process.cwd(), 'pages/kontakt.md'))) {
		const kontakt = fs.readFileSync(path.resolve(process.cwd(), 'pages/kontakt.md'), 'utf8');

		const html = await remark().use(remarkHtml).process(kontakt);

		return {
			props: {
				kontakt: html.toString(),
			},
		};
	} else {
		return {
			props: {
				kontakt: '!Dev Build!',
			},
		};
	}
}
