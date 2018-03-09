#!/usr/bin/env node

/**
 * Returns a prettified stringified representation of item
 * @param {any} item    the item to pretty print
 * @returns {string}    the pretty printed transformation
 */
function prettyPrint(item) {
    return JSON.stringify(item, null, 2);
}

/**
 * 
 * @param {any} ctx Cordova context 
 */
function assessPath(ctx) {
    return ctx.opts.projectRoot + "/assess-www"
}

/**
 * runs npm install in the project
 * @param {any} ctx Cordova context
 * @returns {void}
 */
function installRequiredDependencies(ctx) {
    var shell = ctx.requireCordovaModule("shelljs");
    return (shell.exec("cd " + assessPath(ctx) + " && npm install").code === 0);
}

module.exports = function(ctx) {
    var path = ctx.requireCordovaModule("path"),
        shell = ctx.requireCordovaModule("shelljs"),
        fs = ctx.requireCordovaModule("fs"),
        Q = ctx.requireCordovaModule("q"),
        deferral = Q.defer(),
        webpackResult,
        events = ctx.requireCordovaModule("cordova-common").events;

    if (ctx.cmdLine.toLowerCase().indexOf("--notransform") > -1) {
        return;
    }

    events.emit("info", "Running npm install...");
    installRequiredDependencies(ctx);

    
    events.emit("info", "Starting webpack bundling and transpilation phase...");

    if (ctx.cmdLine.toLowerCase().indexOf("--release") > -1) {
        // release mode gets different settings
        events.emit("verbose", "... building release bundle");
        webpackResult = 
        (shell.exec("cd " + assessPath(ctx) + " && npm run build-release").code === 0);
        
    } else {
        // use the debug configuration
        events.emit("verbose", "... building debug bundle");
        webpackResult = 
        (shell.exec("cd " + assessPath(ctx) + " && npm run build").code === 0);
    }

    if (webpackResult) {
        events.emit("info", "... webpack bundling and typescript transpilation phase complete!");
        shell.exec("rm -rf " + ctx.opts.projectRoot + "/www");
        shell.exec("mkdir " + ctx.opts.projectRoot + "/www");
        shell.exec("cp -R " + assessPath(ctx) + "/dist/* " + ctx.opts.projectRoot + "/www");
        deferral.resolve();
    } else {
        events.emit("error", "Error in webpack bundling");
        deferral.reject("Error in webpack bundling");
    } 

    return deferral.promise;
}