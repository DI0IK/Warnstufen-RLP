const key = document.getElementById('key');
const date = document.getElementById('date');
const updateBTN = document.getElementById('update');
const dataTable = document.getElementById('data');
const banList = document.getElementById('banList');

let bannedIPs = [];

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
					const hasBeenBanned = bannedIPs.includes(row[1]);
					const tr = document.createElement('tr');
					for (let j = 0; j < row.length; j++) {
						const td = document.createElement('td');
						td.innerHTML = row[j];
						if (hasBeenBanned) {
							td.style.textDecoration = 'line-through';
						}
						tr.appendChild(td);
					}
					tr.onclick = () => {
						const confirmed = confirm('Ip will be banned');

						if (confirmed) {
							banIP(rows[i].split('\t')[1]);
							loadBanList();
							loadData();
						}
					};
					dataTable.appendChild(tr);
				}
			}
		})
		.catch((error) => {
			console.log(error);
			dataTable.innerHTML = '<tr><td>Error</td></tr>';
		});
}

function banIP(ip) {
	fetch(`/admin/ban/add?apiKey=${key.value}&ip=${ip}`)
		.then((response) => {
			return response.text();
		})
		.then((text) => {
			console.log(text);
		})
		.catch((error) => {
			console.log(error);
		});
}

function unbanIP(ip) {
	fetch(`/admin/ban/remove?apiKey=${key.value}&ip=${ip}`)
		.then((response) => {
			return response.text();
		})
		.then((text) => {
			console.log(text);
		})
		.catch((error) => {
			console.log(error);
		});
}

function loadBanList() {
	fetch(`/admin/ban/list?apiKey=${key.value}`)
		.then((response) => {
			return response.json();
		})
		.then((array) => {
			console.log(array);
			array = array.sort((a, b) => {
				if (a > b) return 1;
				if (a < b) return -1;
				return 0;
			});

			banList.innerHTML = '';
			for (let i = 0; i < array.length; i++) {
				if (!array[i]) continue;
				const li = document.createElement('li');
				li.innerText = `${array[i]}`;
				console.log(array[i]);
				li.onclick = () => {
					const confirmed = confirm('Ip will be unbanned');
					if (confirmed) {
						unbanIP(array[i]);
						loadBanList();
						loadData();
					}
				};
				banList.appendChild(li);
			}

			bannedIPs = array;
		});
}

key.addEventListener('change', () => {
	loadData();
	loadBanList();
});
date.addEventListener('change', () => {
	loadData();
	loadBanList();
});
updateBTN.addEventListener('click', () => {
	loadData();
	loadBanList();
});
