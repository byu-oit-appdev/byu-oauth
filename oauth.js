var OAuth = require('./index.js');


//	allow module to be run from terminal
if (require.main === module) {

	//	get function being called
	var method = OAuth[process.argv[2]];
	if (method == null) throw new Error("No function named " + method);

	//	get grant type
	var grantType = OAuth.grantType.hasOwnProperty(process.argv[3])
				  ?	OAuth.grantType[process.argv[3]]
				  : process.argv[3];

	//	get args
	var args = {};
	for (var i = 4; i < process.argv.length; i++) {
		if (process.argv[i].indexOf("--") == 0) {
			var argName = process.argv[i].slice(2);
			if (i + 1 < process.argv.length && process.argv[i + 1].indexOf("--") != 0) {
				args[argName] = process.argv[i + 1];
			} else {
				args[argName] = true;
			}
		}
	}

	//	call function
	var functionCall = {
		then: function (callback) {
			callback(new Error("Could not call function specified."));
		}
	}
	if (method === OAuth.getAccessToken) {
		functionCall = method(grantType, args);
	} else if (method === OAuth.generateAuthorizationURL) {
		functionCall = method(grantType, process.argv[4], process.argv[5]);
	}
	functionCall.then(function (err, res) {
		if (err) {
			console.error(err);
		} else {
			console.log(res);
		}
	});
}