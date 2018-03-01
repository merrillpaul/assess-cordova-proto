import "reflect-metadata";

import "../styles/base.scss";

import config from "@appEnvironment";

import { Container } from "typedi";
import { Bootstrapper } from "./bootstrap";

const bootup = (inCordova) => {
	// console.log('Target endpoint', config.centralEndpoint, config.branch, config.config);
	Container.get(Bootstrapper).startup(inCordova);
};

if (window.cordova) {
	document.addEventListener("deviceready", () => bootup(true), false);
} else {
	document.addEventListener("DOMContentLoaded", bootup);
}
