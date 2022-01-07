const key = document.getElementById('key');
const date = document.getElementById('date');
const updateBTN = document.getElementById('update');
const dataTable = document.getElementById('data');

function loadData() {
	fetch(`/admin/data.tsv?apiKey=${key.value}&date=${date.value}`)
		.then((response) => {
			return response.text();
		})
		.then((text) => {
			dataTable.innerHTML = '';
			const rows = text.split('\n').sort((a, b) => {
				const dateA = new Date(a.split('\t')[0]);
				const dateB = new Date(b.split('\t')[0]);
				return dateB - dateA;
			});
			for (let i = 0; i < rows.length; i++) {
				if (i === 0) {
					const header = rows[i].split('\t');
					const tr = document.createElement('tr');
					for (let j = 0; j < header.length; j++) {
						if (j === 0) {
							const th = document.createElement('th');
							th.innerText = new Date(header[j]).toLocaleString();
							tr.appendChild(th);
						} else {
							const th = document.createElement('th');
							th.innerText = header[j];
							tr.appendChild(th);
						}
					}
					dataTable.appendChild(tr);
				} else {
					const row = rows[i].split('\t');
					if (!row[0]) continue;
					const tr = document.createElement('tr');
					for (let j = 0; j < row.length; j++) {
						const td = document.createElement('td');
						td.innerHTML = row[j];
						tr.appendChild(td);
					}
					dataTable.appendChild(tr);
				}
			}
		})
		.catch((error) => {
			console.log(error);
			dataTable.innerHTML = '<tr><td>Error</td></tr>';
		});
}

key.addEventListener('change', loadData);
date.addEventListener('change', loadData);
updateBTN.addEventListener('click', loadData);
