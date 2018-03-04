import { Container, Service } from "typedi";



interface IWithName {
	name: string;
}

export function Logger() {
    return (object: any, propertyName: string, index?: number) => {
        const logger = new LoggingService(object.constructor.name);
        Container.registerHandler({ object, propertyName, index, value: containerInstance => logger });
    };
}

export class LoggingService {
    constructor(private src: IWithName | string) {

    }

	public info(msg?: string, ...data: any[]): void {       
        console.log.apply(console, [`%c ${this.buildLogArray(msg, data)}`, 'color: blue']);
	}

	public error(msg?: string, ...data: any[]): void {
        console.log.apply(console, [`%c ${this.buildLogArray(msg, data)}`, 'color: red; font-weight: bold']);
        console.trace.apply(console);
	}

	public warn(msg?: string, ...data: any[]): void {
		console.log.apply(console, [`%c ${this.buildLogArray(msg, data)}`, 'color: orange']);
	}

	public debug(msg?: string, ...data: any[]): void {
		console.log.apply(console, [`%c ${this.buildLogArray(msg, data)}`, 'color: black']);
	}

	public success(msg?: string, ...data: any[]): void {
		console.log.apply(console, [`%c ${this.buildLogArray(msg, data)}`, 'color: green; font-weight: bold']);
	}

	private buildLogArray(msg?: string, data?): string {
		const name = this.src instanceof String || typeof this.src === "string" ? this.src : this.src.name;
        return `[${name}] >>>> ${msg} ${data && data.length > 0 ? data.map(it => JSON.stringify(it, null, 5)): ""}`;
	}	
}
