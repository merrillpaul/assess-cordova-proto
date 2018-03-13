'use strict';

module.exports = function (context) {
	var req = context.requireCordovaModule,

		Q = req('q'),
		path = req('path'),
		fs = require("./lib/filesystem")(Q, req('fs'), path),
		settings = require("./lib/settings")(fs, path),

		android = require("./lib/android")(context),
		ios = require("./lib/ios")(Q, fs, path, req('plist'), req('xcode'));


    // write any other stuff which returns promises to cleanup while removing the plugin ( which we should not DUH for assess )
	return settings.get()
		.then(function (config) {
			return Q.all([
				android.clean(config),
				ios.clean(config)
			]);
		})
		.catch(function(err) {
			if (err.code === 'NEXIST') {
				console.log("app-settings.json not found: skipping clean");
				return;
			}

			console.log ('unhandled exception', err);

			throw err;
		});
};
