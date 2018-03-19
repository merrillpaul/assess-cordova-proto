import "reflect-metadata";

import { AppContext } from '@assess/app-context';
import { GiveHelperService } from '@assess/plugins/utils/give-helper';
import { BatteryService } from '@assess/shared/battery/battery-service';
import { AppPreferences } from '@assess/shared/config/app-preferences';
import { LoggingService } from '@assess/shared/log/logging-service';
import { Container, Inject, Service } from "typedi";

const bootup = (inCordova) => {
    const ctx : AppContext = Container.get(AppContext);
    if (inCordova && (device && device.platform !== 'browser')) {
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

export const batteryService = () => {
    return Container.get(BatteryService);
}

if (window.cordova) {
	document.addEventListener("deviceready", () => bootup(true) , false);
} else {
	document.addEventListener("DOMContentLoaded", () => bootup(false));
}
