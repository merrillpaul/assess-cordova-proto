'use strict';

module.exports = function (context) {
	var req = context.requireCordovaModule,
		Q = req('q'),
		path = req('path'),
		fs = require("./lib/filesystem")(Q, req('fs'), path),
		ios = require("./lib/ios")(Q, fs, path, req('plist'), req('xcode'));


    // write stuff we want to run after our plugin is installed
	return true;
};