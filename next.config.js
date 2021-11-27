/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	redirects() {
		return [
			process.env.WARTUNG === 'true'
				? { source: '/((?!maintenance).*)', destination: '/maintenance', permanent: false }
				: null,
		].filter(Boolean);
	},
};
