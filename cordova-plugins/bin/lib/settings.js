/**
 * Settings management methods
 *
 *
 */
'use strict';

var appSettingsPath = 'app-settings.json';

module.exports = function(fs, path) {
	
	function get() {
		return fs.exists(appSettingsPath)
			.then(function() { return fs.readFile(appSettingsPath); })
			.then(JSON.parse)
			.then(validateFormat);
	}
	
	function create() {
		var basePath = path.resolve(__dirname, '../../' + appSettingsPath);
		
		return fs.copy(basePath, appSettingsPath);
	}
	
	function remove() {
		return fs.unlink(appSettingsPath)
			.catch(function(err) {
				if (err && err.code !== 'ENOENT') {
					throw err;
				}
			});
	}
	
	function validateFormat(config) {
		var err = "app-settings.json not valid: is empty or is not an array",
			settingsAttr = config.settings,
			i18n = config.i18n;
		if(Array.isArray(settingsAttr) && Object.keys(settingsAttr[0]).length) {
			return config;
		}
		
		throw err;
	}

	return {
		get: get,
		create: create,
		remove: remove
	};
};