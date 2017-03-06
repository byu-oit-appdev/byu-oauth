'use strict';

const https = require('https');

const AUTHORIZATION = 'authorization_endpoint';
const AUTHORIZATION_CODE = 'code';
const CLIENT_ID = 'client_id';
const CLIENT_SECRET = 'client_secret';
const PASSWORD = 'password';
const REDIRECT_URI = 'redirect_uri';
const REFRESH_TOKEN = 'refresh_token';
const TOKEN = 'token_endpoint';
const USERNAME = 'username';
const WELL_KNOWN = 'https://api.byu.edu/.well-known/openid-configuration';

//	various errors that can be returned by the module
const error = {
	access_token: 'Could not acquire access token. Returned code: ',
	grant_type: {
		token: 'Invalid grant type to get access token. Valid types are authorization_code, client_credentials, password (resource owner), and refresh_token.',
		url: 'Invalid grant type to get redirect URL. Valid types are authorization_code and implicit.'
	},
	missing_args: 'Missing arguments: ',
	no_authorization: 'Could not retrieve authorization code. Please check that your client ID is correct and that your redirect URL reflects that specified in WSO2.'
};

//	the grant types the modules supports
const grant_type = {
	AUTHORIZATION_CODE: 'authorization_code',
	CLIENT_CREDENTIALS: 'client_credentials',
	IMPLICIT: 'implicit',
	REFRESH_TOKEN: 'refresh_token',
	RESOURCE_OWNER: 'password'
};

//	the arguments required for getting access tokens for each grant type
let required_args = {};
required_args[grant_type.AUTHORIZATION_CODE] = [CLIENT_ID, CLIENT_SECRET, AUTHORIZATION_CODE, REDIRECT_URI];
required_args[grant_type.CLIENT_CREDENTIALS] = [CLIENT_ID, CLIENT_SECRET];
required_args[grant_type.REFRESH_TOKEN] = [CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN];
required_args[grant_type.RESOURCE_OWNER] = [CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD];

//	the response types available for authorization url
let response_types = {};
response_types[grant_type.AUTHORIZATION_CODE] = 'code';
response_types[grant_type.IMPLICIT] = 'token';

function checkArgs(grant_type, args) {
	let missing = [];
	let required = required_args[grant_type];

	//	validate grant type
	if (required == null)
		return Promise.reject(new Error(error.grant_type.token));

	//	add any missing arguments to 'missing' array
	for (let i = 0; i < required.length; i++)
		if (!args.hasOwnProperty(required[i]))
			missing.push(required[i]);

	//	if 'missing' array is not empty, return error with missing arguments
	if (missing.length > 0)
		return Promise.reject(new Error(error.missing_args + missing));

	//	'missing' array is empty; all arguments are accounted for
	return Promise.resolve();
}

function getAccessToken(grant_type, args) {

	//	check for correct arguments, then get BYU API well-known
	return checkArgs(grant_type, args).then(getWellKnown).then((well_known) => new Promise((resolve, reject) => {
		let authorization, body, hostname, path, request, target_url;

		//	break apart URL for request
		target_url = well_known[TOKEN].slice(well_known[TOKEN].indexOf('//') + 2);
		hostname = target_url.slice(0, target_url.indexOf('/'));
		path = target_url.slice(target_url.indexOf('/'));

		//	authorize with client ID & secret
		authorization = 'Basic ' + new Buffer(args[CLIENT_ID] + ':' + args[CLIENT_SECRET]).toString('base64');
		
		//	don't include client_id or client_secret in query parameters
		delete args[CLIENT_ID];
		delete args[CLIENT_SECRET];

		//	construct message body
		body = 'grant_type=' + grant_type;
		for (let arg in args) body += '&' + arg + '=' + args[arg];

		//	send request
		request = https.request({
			hostname: hostname,
			path: path,
			method: 'POST',
			headers: {
				'Authorization': authorization,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}, parseResponse(resolve, reject, 'getting access token: ')).on('error', reject);
		request.write(body);
		request.end();
	}));
}

function generateAuthorizationURL(grant_type, client_id, redirect_uri) {

	return getWellKnown().then((well_known) => new Promise((resolve, reject) => {

		//	check arguments
		let missing = [];
		if (grant_type == null) missing.push('grant_type');
		if (client_id == null) missing.push('client_id');
		if (redirect_uri == null) missing.push('redirect_uri');

		//	get response type
		let response_type = response_types[grant_type];

		//	check grant_type
		if (response_type == null) reject(new Error(error.grant_type.url));

		//	construct URL
		resolve(well_known[AUTHORIZATION]
			+ '?response_type=' + response_type
			+ '&client_id=' + client_id
			+ '&redirect_uri=' + redirect_uri
			+ '&scope=openid');
	}));
}

function getWellKnown() {

	return new Promise((resolve, reject) => {

		https.get(WELL_KNOWN, parseResponse(resolve, reject, 'getting well-known: '))
			.on('error', reject);
	});
}

function parseResponse(resolve, reject, prefix) {

	if (prefix == null) prefix = '';

	return (response) => {

		response.setEncoding('utf8');
		response.on('data', (data) => {

			try {

				resolve(JSON.parse(data));

			} catch (exception) {

				reject(new Error(prefix + data));
			}
		});
		response.on('end', () => {

			if (response.statusCode != 200)
				reject(new Error(prefix + response.statusCode + ": " + response.statusMessage));
		});
	};
}

//	exports functions and grant types
module.exports = {
	getAccessToken,
	generateAuthorizationURL,
	getWellKnown,
	grant_type,
	grantType: grant_type
};