/* global cordova, FileSystem */

var exec = require('cordova/exec'), TarService = function () {};

TarService.prototype.untar = function (fileName, outputDirectory, callback) {
    var win = function(result) {
        if (callback) {
            callback(true);
        }
    },fail = function(result) {
        console.log('TarService Error cordova plugin trying to untar ' + fileName + ' due to ' + JSON.stringify(result));
        if (callback) {
            callback(false);
        }
    };
    console.log('TarService cordova plugin trying to untar ' + fileName + ' to ' + outputDirectory);
    exec(win, fail, 'Tar', 'untar', [fileName, outputDirectory]);
};

TarService.prototype.tar = function (sourceFolder, targetFileName, callback) {
   // TODO implement later
};

module.exports = TarService;