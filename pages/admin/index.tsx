import Head from 'next/head';
import Layout from '../../components/layout';

export default function admin({ props }) {
	return (
		<Layout>
			<Head>
				<title>Admin</title>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<div id="inputs">
				Key: <input type="password" id="key" />
				Date: <input type="date" id="date" />
				<button id="update">Update</button>
			</div>
			<div id="banListOutputs">
				<h2>Ban List</h2>
				<div>
					<ul id="banList"></ul>
				</div>
			</div>
			<div id="dataOutputs">
				<h2>Logs</h2>
				<div className="tableWrapper">
					<table id="data"></table>
				</div>
			</div>
			<script src="/scripts/admin.js"></script>
			<style>
				{'table { width: 100%; }' +
					'table, th, td { border: 1px solid black; border-collapse: collapse; }' +
					'th, td { padding: 5px; text-align: left; }' +
					'table#data tr:nth-child(even) { background-color: #eee; }' +
					'table#data tr:nth-child(odd) { background-color: #fff; }' +
					'table#data th { background-color: #333; color: white; }' +
					'#banList { list-style-type: none; }' +
					'#banList li { display: inline; border: 1px solid black; padding: 5px; margin: 5px; }' +
					'main { display:grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 8fr; }' +
					'#inputs { grid-column: 1; grid-row: 1; }' +
					'#dataOutputs { grid-column: 1; grid-row: 2; }' +
					'#banListOutputs { grid-column: 2; grid-row: 2; }' +
					'.tableWrapper { overflow: scroll; height: 95%; }' +
					'.tableWrapper table { width: 100%; }' +
					'table tr th { position: sticky; top: 0; background-color: #333; color: white; }' +
					'div { margin:0 !important; padding:0 !important}'}
			</style>
		</Layout>
	);
}
