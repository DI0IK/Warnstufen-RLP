import { APIDistrict } from '../api/definitions/districts';

export default function SitemapPage() {}

export async function getServerSideProps({ res }) {
	const baseurl = 'https://www.warnzahl-rlp.de';
	let sitemap =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

	const pages = [
		{
			url: '/',
			changefreq: 'daily',
			priority: '1.0',
		},
		{
			url: '/lk/:lk',
			changefreq: 'daily',
			priority: '0.9',
		},
		{
			url: '/docs',
			changefreq: 'weekly',
			priority: '0.5',
		},
	];

	for (const page of pages) {
		if (!page.url.includes(':lk')) {
			sitemap += `<url>\n<loc>${baseurl}${page.url}</loc>\n<changefreq>${page.changefreq}</changefreq>\n<priority>${page.priority}</priority>\n</url>\n`;
		} else {
			for (let apiLK of APIDistrict) {
				sitemap += `<url>\n<loc>${baseurl}${page.url.replace(
					':lk',
					apiLK.replace(/ /g, '_')
				)}</loc>\n<changefreq>${page.changefreq}</changefreq>\n<priority>${
					page.priority
				}</priority>\n</url>\n`;
			}
		}
	}

	sitemap += '</urlset>';

	res.setHeader('Content-Type', 'application/xml');
	res.write(sitemap);
	res.end();

	return {
		props: {},
	};
}
