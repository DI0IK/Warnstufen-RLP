import Head from 'next/head';
import Layout from '../../components/layout';

export default function admin({ props }) {
	return (
		<Layout>
			<Head>
				<title>Admin</title>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<h1>Admin</h1>
			<div>
				Key: <input type="password" id="key" />
				Date: <input type="date" id="date" />
				<button id="update">Update</button>
			</div>
			<div>
				<table id="data"></table>
			</div>
			<script src="/scripts/admin.js"></script>
			<style>
				{'table { width: 100%; }' +
					'table, th, td { border: 1px solid black; border-collapse: collapse; }' +
					'th, td { padding: 5px; text-align: left; }' +
					'table#data tr:nth-child(even) { background-color: #eee; }' +
					'table#data tr:nth-child(odd) { background-color: #fff; }' +
					'table#data th { background-color: #333; color: white; }'}
			</style>
		</Layout>
	);
}
