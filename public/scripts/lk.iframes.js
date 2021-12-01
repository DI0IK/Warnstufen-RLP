function load() {
	document.getElementsByClassName('order')[0].innerHTML = '';

	if (!LINK_OVERRIDE && loadShareLink()) return;

	const settings = getSettings();

	const iframes = document.querySelectorAll('iframe');
	for (const iframe of iframes) {
		iframe.style.display = 'none';
	}
	console.log('%cIframes hidden', 'color: #00f', iframes);

	for (const key of settings.hidden) {
		const child = document.createElement('div');
		child.className = key + '-ordering';
		child.innerText = key
			.replace(/ae/g, 'ä')
			.replace(/([A-Z])/g, ' $1')
			.trim();
		document.getElementsByClassName('order')[0].appendChild(child);
	}
	console.log('%cIframes not visible', 'color: #00f', settings.hidden);

	const trenner = document.createElement('div');
	trenner.className = 'trenner';
	document.getElementsByClassName('order')[0].appendChild(trenner);

	for (let i = 0; i < settings.visible.length; i++) {
		if (settings.visible[i]) {
			document
				.getElementById('iframes')
				.appendChild(document.getElementById(settings.visible[i]));
			document.getElementById(settings.visible[i]).style.display = 'block';

			const child = document.createElement('div');
			child.className = settings.visible[i] + '-ordering';
			child.innerText = settings.visible[i]
				.replace(/ae/g, 'ä')
				.replace(/([A-Z])/g, ' $1')
				.trim();
			document.getElementsByClassName('order')[0].appendChild(child);
		}
	}
	console.log('%cIframes shown', 'color: #00f', settings.visible);

	for (const child of document.getElementsByClassName('order')[0].children) {
		child.addEventListener('click', (e) => {
			console.log('%cClicked', 'color: #00f', e.target.innerText);
			const id = e.target.className.split('-ordering')[0];
			const elemHeight = e.target.getBoundingClientRect().height;
			const mouseLowerThanMiddleOfElem =
				e.clientY < e.target.getBoundingClientRect().top + elemHeight / 2;

			const isVisible = settings.visible.includes(id);
			const pos = isVisible ? settings.visible.indexOf(id) : settings.hidden.indexOf(id);

			/**
			 * Move elements from the hidden list to the visible list if the mouse is above the middle of the element
			 * Move elements from the visible list to the hidden list if the mouse is below the middle of the element and the element is not already in the hidden list and the pos in 0
			 * Move visible elements down if the mouse is above the middle of the element and the element is not already in the hidden list and the pos in not 0
			 * Move visible elements up if the mouse is below the middle of the element and the element is not already in the hidden list
			 * Never sort the lists
			 */
			if (!mouseLowerThanMiddleOfElem) {
				if (isVisible) {
					settings.visible.splice(pos + 2, 0, id);
					settings.visible.splice(pos, 1);
				} else if (!isVisible) {
					settings.hidden.splice(pos, 1);
					settings.visible.splice(0, 0, id);
				}
			} else {
				if (isVisible && pos === 0) {
					settings.visible.splice(pos, 1);
					settings.hidden.push(id);
				} else if (isVisible) {
					settings.visible.splice(pos - 1, 0, id);
					settings.visible.splice(pos + 1, 1);
				} else {
					return;
				}
			}

			saveSettings(settings);
			load();
		});
	}

	if (document.getElementById('pre-js-wrapper'))
		document.getElementById('pre-js-wrapper').style.display = 'none';
}

setTimeout(() => {
	load();
}, 500);

function getSettings() {
	if (LINK_OVERRIDE !== false) return LINK_OVERRIDE;
	let settings = {
		hidden: ['MomentanErkrankt'],
		visible: ['Inzidenz', 'Hospitalisierung'],
	};
	if (localStorage.getItem('settings')) {
		const settingOverrides = JSON.parse(localStorage.getItem('settings'));
		// Check if all default settings are overwritten
		for (const key in settings) {
			for (const setting of settings[key]) {
				if (
					!settingOverrides.hidden.includes(setting) &&
					!settingOverrides.visible.includes(setting)
				) {
					settingOverrides.hidden.push(setting);
				}
			}
		}
		settings = settingOverrides;
	}
	return settings;
}
function restoreSettings() {
	if (LINK_OVERRIDE !== false) {
		LINK_OVERRIDE = false;
		load();
		return;
	}
	if (!localStorage.getItem('settings')) {
		localStorage.removeItem('settings');
	}
}
function saveSettings(settings) {
	if (LINK_OVERRIDE) return;
	localStorage.setItem('settings', JSON.stringify(settings));
}

function generateShareLink(order = true) {
	const settings = getSettings();
	let link = location.protocol + '//' + location.host + location.pathname;
	if (order) {
		let encodedSettings = '';
		for (const key of settings.hidden) {
			encodedSettings += '&hidden=' + encodeURIComponent(key);
		}
		for (const key of settings.visible) {
			encodedSettings += '&visible=' + encodeURIComponent(key);
		}
		link += encodedSettings.replace('&', '?');
	}
	return link;
}

function loadShareLink() {
	const url = location.href;
	const params = url.split('?')[1];
	if (params) {
		console.log('%cLoaded share link', 'color: #00f', params);
		const settings = {
			hidden: [],
			visible: [],
		};
		const paramsArray = params.split('&');
		for (const param of paramsArray) {
			const keyValue = param.split('=');
			if (keyValue[0] === 'hidden') {
				settings.hidden.push(decodeURIComponent(keyValue[1]));
			} else if (keyValue[0] === 'visible') {
				settings.visible.push(decodeURIComponent(keyValue[1]));
			}
		}
		LINK_OVERRIDE = settings;
		load();

		return true;
	}
	return false;
}

LINK_OVERRIDE = false;
