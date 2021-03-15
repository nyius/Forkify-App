import { TIMEOUT_SEC } from './config.js';
import icons from './img/icons.svg';

// Helper Functions
// Get JSON information ----------------------------------------------------------------------------
/**
 *
 * @param {String} url The url that gets to the API. inside the {} is the type of data we expect in
 * @returns
 */
export const getJSON = async function (url) {
	try {
		const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
		const data = await res.json();

		if (!res.ok) throw new Error(`${data.message} (${res.status})`);

		return data;
	} catch (err) {
		throw err;
	}
};

export const sendJSON = async function (uploadData, title) {
	try {
		console.log(uploadData);

		await Promise.race([
			//prettier-ignore
			localStorage.setItem(title,uploadData),

			// doesnt work because he removed POST functionality to his API
			// fetch(url, {
			// 	method: 'POST',
			// 	headers: {
			// 		'Content-Type': 'application/json',
			// 	},
			// 	body: JSON.stringify(uploadData),
			// }),

			timeout(TIMEOUT_SEC),
		]);

		console.log();
		// const data = await res.json();
		const id = Math.floor(1000000000000 + Math.random() * 9000000000000);
		// if (!res.ok) throw new Error(`${data.message} (${res.status})`);

		return id;
	} catch (err) {
		throw err;
	}
};

/**
 *
 * @param {Num} s Takes a time (in seconds) to wait for this timeout
 * @returns
 */
const timeout = function (s) {
	return new Promise(function (_, reject) {
		setTimeout(function () {
			reject(new Error(`Request took too long! Timeout after ${s} second`));
		}, s * 1000);
	});
};

// Loading spinner ----------------------------------------------------------------------------
export const loadingSpinner = function () {
	return (
		<div className="spinner">
			<svg>
				<use href={icons + '#icon-loader'}></use>
			</svg>
		</div>
	);
};

// Render Error ----------------------------------------------------------------------------
export const renderError = function (message) {
	return (
		<div className="error">
			<div>
				<svg>
					<use href={icons + '#icon-alert-triangle'}></use>
				</svg>
			</div>
			<p>{message}</p>
		</div>
	);
};

// Display message ----------------------------------------------------------------------------
export const message = (messageText) => {
	return (
		<div className="message">
			<div>
				<svg>
					<use href={icons + '#icon-smile'}></use>
				</svg>
			</div>
			<p>{messageText}</p>
		</div>
	);
};

// Blur overlay ----------------------------------------------------------------------------
export const overlay = function () {
	return <div className="overlay"></div>;
};
