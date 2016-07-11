const AUTHORIZATION = "authorization_endpoint";
const AUTHORIZATION_CODE = "code";
const CLIENT_ID = 'client_id';
const CLIENT_SECRET = 'client_secret';
const PASSWORD = 'password';
const REDIRECT_URI = 'redirect_uri';
const USERNAME = 'username';
const TOKEN = "token_endpoint";
const WELL_KNOWN = "https://api.byu.edu/.well-known/openid-configuration";

var http = require('https');

//	various errors that can be returned by the module
var error = {
	accessToken: "Could not acquire access token.  Returned code ",
	grantType: {
		token: "Invalid grant type to get access token.  Valid types are "
			 + "authorization_code, client_credentials, and password (resource owner).",
		url: "Invalid grant type to get redirect URL.  Valid types are authorization_code and implicit"
	},
	missingArgs: "Missing arguments ",
	noAuthorization: "Could not retrieve authorization code.  Please check that your client ID is correct"
		+ " and that your redirect URL reflects that specified in WSO2."
};

//	the grant types the module supports
var grantType = exports.grantType = {
	AUTHORIZATION_CODE: "authorization_code",
	CLIENT_CREDENTIALS: "client_credentials",
	IMPLICIT: "implicit",
	RESOURCE_OWNER: "password"
};

//	the arguments required for getting access tokens for each grant type
var requiredArgs = {};
requiredArgs[grantType.AUTHORIZATION_CODE] = [CLIENT_ID, CLIENT_SECRET, AUTHORIZATION_CODE, REDIRECT_URI];
requiredArgs[grantType.CLIENT_CREDENTIALS] = [CLIENT_ID, CLIENT_SECRET];
requiredArgs[grantType.RESOURCE_OWNER] = [CLIENT_ID, CLIENT_SECRET, USERNAME, PASSWORD];

//	checks to make sure all arguments for grant type are given
function checkArgs(grantType, args, callback) {

	//	validate grant type for retrieving access token
	if (!requiredArgs.hasOwnProperty(grantType)) {
		callback(new Error(error.grantType.token));
		return false;
	}

	//	add any missing arguments to 'missing' array
	var required = requiredArgs[grantType];
	var missing = [];
	for (var i = 0; i < required.length; i++) {
		if (!args.hasOwnProperty(required[i])) missing.push(required[i]);
	}

	//	if 'missing' array is not empty, return error with missing arguments
	if (missing.length > 0) {
		callback(new Error(error.missingArgs + missing));
		return false;
	}

	//	if 'missing' array is empty, all arguments are accounted for
	return true;
}

exports.getAccessToken = function (grantType, args) {

	return {
		then: function (callback) {

			//	if grant type is bad, stop execution (error has already been sent to callback)
			if (!checkArgs(grantType, args, callback)) return;

			//	get BYU API well-known
			getWellKnown().then(function (wellKnown) {

				//	get parts of URL to which to send request for access token
				var targetURL = wellKnown[TOKEN];
				targetURL = targetURL.slice(targetURL.indexOf("//") + 2);
				var hostname = targetURL.slice(0, targetURL.indexOf("/"));
				var path = targetURL.slice(targetURL.indexOf("/"));

				//	authorize with client ID & secret
				var authorization = "Basic " 
					+ new Buffer(args[CLIENT_ID] + ":" + args[CLIENT_SECRET]).toString("base64");

				//	construct request for access token
				var request = http.request({
					hostname: hostname,
					path: path,
					method: "POST",
					headers: {
						"Authorization": authorization,
						"Content-Type": "application/x-www-form-urlencoded"
					}
				}, function (response) {

					response.setEncoding("utf8");
					response.on("data", function (data) {

						//	send token to callback
						callback(null, JSON.parse(data));

					}).on("end", function () {

						//	if response other than 200 send error to callback
						if (response.statusCode != 200) callback(error.clientCredentials
							+ response.statusCode + ": " + response.statusMessage);

					});
				}).on("error", function (err) {

					//	if there's an error sending the request, send it to callback
					callback(err);

				});

				//	done with client id and secret
				delete args[CLIENT_ID], args[CLIENT_SECRET];

				//	construct message body
				var body = "grant_type=" + grantType;
				for (var arg in args) {
					body += "&" + arg + "=" + args[arg];
				}

				//	send request
				request.write(body);
				request.end();
			});

		}
	}
}

exports.generateAuthorizationURL = function (grantType, clientID, redirectURI) {
	return {
		then: function (callback) {

			//	if missing arguments, send error to callback
			var missing = [];
			if (grantType == null) missing.push("grantType");
			if (clientID == null) missing.push("clientID");
			if (redirectURI == null) missing.push("redirectURI");

			//	get response type
			var responseTypes = {};
			responseTypes[exports.grantType.AUTHORIZATION_CODE] = "code";
			responseTypes[exports.grantType.IMPLICIT] = "token";
			var responseType = responseTypes[grantType];

			//	if bad grant type, send error to callback
			if (responseType == null) callback(new Error(error.grantType.url));

			//	get BYU API well-known
			getWellKnown().then(function (wellKnown) {

				//	send URL to callback
				callback(wellKnown[AUTHORIZATION]
					+ "?response_type=" + responseType
					+ "&client_id=" + clientID
					+ "&redirect_uri=" + redirectURI
					+ "&scope=openid");

			});

		}
	}
}

//	gets the information in BYU API well-known
function getWellKnown() {
	return {
		then: function (callback) {

			//	send GET request to URL
			http.get(exports.wellKnown, function (response) {

				//	construct response body
				var body = "";
				response.on("data", function (data) {
					body += data;
				}).on("end", function () {

					//	send JSON response to callback
					callback(JSON.parse(body));

				});
			});
		}
	}
}

//	allows easy changes to well-known URL
exports.wellKnown = WELL_KNOWN;