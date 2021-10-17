import { Route } from './routes';
import { APIDistrict } from './definitions/districts';

export function genSitemap(endpoints: Route[]): string {
	let sitemap =
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
	for (const endpoint of endpoints) {
		if (endpoint.type === 'STATIC' && endpoint.listInSitemap && !endpoint.path.includes(':lk')) {
			sitemap += `<url><loc>https://www.warnzahl-rlp.de${endpoint.path}</loc></url>\n`;
		} else if (endpoint.path.includes(':lk')) {
			for (const district of APIDistrict) {
				sitemap += `<url><loc>https://www.warnzahl-rlp.de${endpoint.path.replace(
					':lk',
					district
				)}</loc></url>\n`;
			}
		}
	}
	sitemap += '</urlset>';
	return sitemap;
}
