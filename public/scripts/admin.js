const key = document.getElementById('key');
const date = document.getElementById('date');
const updateBTN = document.getElementById('update');
const dataTable = document.getElementById('data');
const banList = document.getElementById('banList');
const autoBanList = document.getElementById('autoBanList');

let bannedIPs = [];
let bannedPaths = [];

function loadData() {
	return fetch(`/admin/data.tsv?apiKey=${key.value}&date=${date.value}`)
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
							const num = document.createElement('th');
							num.innerText = 'Nr.';
							tr.appendChild(num);

							const th = document.createElement('th');
							th.innerText = 'Date';
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
						if (j === 0) {
							const num = document.createElement('td');
							num.innerText = i;
							tr.appendChild(num);
							td.innerText = new Date(row[j]).toLocaleString();
						} else {
							td.innerHTML = row[j];
						}
						if (j === 1) {
							td.onclick = () => {
								if (hasBeenBanned) {
									const confirmed = confirm(`Ip ${row[1]} will be unbanned`);
									if (confirmed) {
										unbanIP(row[1]).finally(() => {
											loadBanList();
											loadAutoBanList();
											loadData();
										});
									}
								} else {
									const confirmed = confirm(`Ip ${row[1]} will be banned`);
									if (confirmed) {
										banIP(row[1]).finally(() => {
											loadBanList();
											loadAutoBanList();
											loadData();
										});
									}
								}
							};
							if (row[10] === 'true') {
								td.style.color = 'red';
							}
						}
						if (j === 3) {
							td.onclick = () => {
								if (bannedPaths.includes(row[3])) {
									const confirmed = confirm(`Path ${row[3]} will be unbanned`);
									if (confirmed) {
										removeAutoBan(row[3]).finally(() => {
											loadBanList();
											loadAutoBanList();
											loadData();
										});
									}
								} else {
									const confirmed = confirm(`Path ${row[3]} will be banned`);
									if (confirmed) {
										addAutoBan(row[3]).finally(() => {
											loadBanList();
											loadAutoBanList();
											loadData();
										});
									}
								}
							};
							if (bannedPaths.includes(row[3])) {
								td.style.color = 'red';
							}
						}
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

function banIP(ip) {
	return fetch(`/admin/ban/add?apiKey=${key.value}&ip=${ip}`)
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
	return fetch(`/admin/ban/remove?apiKey=${key.value}&ip=${ip}`)
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
	return fetch(`/admin/ban/list?apiKey=${key.value}`)
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
					const confirmed = confirm(`Ip ${array[i]} will be unbanned`);
					if (confirmed) {
						unbanIP(array[i]).finally(() => {
							loadBanList();
							loadAutoBanList();
							loadData();
						});
					}
				};
				banList.appendChild(li);
			}

			bannedIPs = array;
		});
}

function addAutoBan(path) {
	return fetch(`/admin/autoban/add?apiKey=${key.value}&path=${path}`)
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

function removeAutoBan(path) {
	return fetch(`/admin/autoban/remove?apiKey=${key.value}&path=${path}`)
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

function loadAutoBanList() {
	return fetch(`/admin/autoban/list?apiKey=${key.value}`)
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

			autoBanList.innerHTML = '';
			for (let i = 0; i < array.length; i++) {
				if (!array[i]) continue;
				const li = document.createElement('li');
				li.innerText = `${array[i]}`;
				console.log(array[i]);
				li.onclick = () => {
					const confirmed = confirm(`Path ${array[i]} will be unbanned`);
					if (confirmed) {
						removeAutoBan(array[i]).finally(() => {
							loadAutoBanList();
							loadBanList();
							loadData();
						});
					}
				};
				autoBanList.appendChild(li);
			}

			bannedPaths = array;
		});
}

key.addEventListener('change', () => {
	loadData();
	loadBanList();
	loadAutoBanList();
});
date.addEventListener('change', () => {
	loadData();
	loadBanList();
	loadAutoBanList();
});
updateBTN.addEventListener('click', () => {
	loadData();
	loadBanList();
	loadAutoBanList();
});
