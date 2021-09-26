function login() {
	const token = document.getElementById('token').value;

	if (token.length < 1) {
		alert('Token is empty');
		return;
	}

	document.cookie = 'token=Bearer ' + token + '; path=/';

	window.location.href = location.origin + location.search.substr(6);
}
