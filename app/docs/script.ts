function createToken() {
	createUserId();
	if (!localStorage.getItem('token')) {
		fetch(`/generateToken?userId=${localStorage.getItem('userId')}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				console.log(data);
				localStorage.setItem('token', data.token);
				document.getElementById('tokenField').innerText = localStorage.getItem('token');
			})
			.catch(function (error) {
				console.log(error);
			});
	}
	document.getElementById('tokenField').innerText = localStorage.getItem('token');
}

function createUserId() {
	if (!localStorage.getItem('userId')) {
		const userId = Math.floor(Math.random() * 10000000);
		localStorage.setItem('userId', userId.toString());
	}
	document.getElementById('userIdField').innerText = localStorage.getItem('userId');
}

function loadTokenIntoCookies() {
	if (localStorage.getItem('token'))
		document.cookie = `token=Bearer ${localStorage.getItem(
			'token'
		)}; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

setInterval(loadTokenIntoCookies, 1000);
