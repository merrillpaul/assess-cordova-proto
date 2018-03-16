import "reflect-metadata";

import { AppContext } from '@assess/app-context';
import { GiveHelperService } from '@assess/plugins/utils/give-helper';
import { AppPreferences } from '@assess/shared/config/app-preferences';
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

export const appPreferences = () => {
    return Container.get(AppPreferences);
}

export const helperService = () => {
    return Container.get(GiveHelperService);
}

if (window.cordova) {
	document.addEventListener("deviceready", () => bootup(true) , false);
} else {
	document.addEventListener("DOMContentLoaded", () => bootup(false));
}
