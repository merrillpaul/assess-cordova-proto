import "reflect-metadata";

import { AppContext } from '@assess/app-context';
import { LoggingService } from '@assess/shared/log/logging-service';
import { Container, Inject, Service } from "typedi";

const bootup = (inCordova) => {
    const ctx : AppContext = Container.get(AppContext);
    if (inCordova) {
        ctx.setInCordova();
    }
};

export const loggingService = () => {
    return new LoggingService('loggingService');
};

if (window.cordova) {
	document.addEventListener("deviceready", () => bootup(true) , false);
} else {
	document.addEventListener("DOMContentLoaded", () => bootup(false));
}
