import { Container, Service } from "typedi";

import { LoggingService } from '@assess/shared/log/logging-service';

export function Logger() {
    return (object: any, propertyName: string, index?: number) => {
        const logger = new LoggingService(object.constructor.name);
        Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
    };
}