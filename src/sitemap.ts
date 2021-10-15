import * as formats from './formats';
import { districts } from './districts';

export function genSiteMap(
	apiRoutes: formats.APIEndpoint[],
	normalRoutes: formats.Route[]
): string {
	const routes = [...apiRoutes, ...normalRoutes];
	const sitemap = routes
		.map((route) => {
			if (!route.path.includes(':lk')) return [route];

			const routes = districts.map((district) => {
				const newPath = route.path.replace(':lk', district).replace(/ /g, '_');
				return { ...route, path: newPath };
			});

			return routes;
		})
		.map((route) => {
			return route.map((r) => {
				if (!r.inSitemap) return '';
				const url = r.path;
				return `<url>
					<loc>${url}</loc>
				</url>`;
			});
		})
		.map((route) => route.filter((r) => r !== ''))
		.filter((route) => route.length > 0);

	return `<?xml version="1.0" encoding="UTF-8"?>
   	<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    	${sitemap.map((r) => r.join('\n')).join('\n')}
	</urlset>`;
}
