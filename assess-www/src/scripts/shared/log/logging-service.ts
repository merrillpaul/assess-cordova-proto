import { AppContext } from '@assess/app-context';
import { FileService } from '@assess/shared/file/file-service';

import { Container, Service } from "typedi";

interface IWithName {
	name: string;
}

const CONSOLE_LOG = 'console.log';

export class LoggingService {

	private appContext: AppContext;
	private logFile: FileEntry;

    constructor(private src: IWithName | string) {
		this.appContext = Container.get(AppContext);
    }

	public info(msg?: string, ...data): void {       
        this.consoleLog( [`%c ${this.buildLogArray(msg, data)}`, 'color: blue']);
	}

	public error(msg?: string, ...data): void {
        this.consoleLog( [`%c ${this.buildLogArray(msg, data)}`, 'color: red; font-weight: bold']);
        console.trace.apply(console);
	}

	public warn(msg?: string, ...data): void {
		this.consoleLog( [`%c ${this.buildLogArray(msg, data)}`, 'color: orange']);
	}

	public debug(msg?: string, ...data): void {
		this.consoleLog( [`%c ${this.buildLogArray(msg, data)}`, 'color: black']);
	}

	public success(msg?: string, ...data): void {
		this.consoleLog( [`%c ${this.buildLogArray(msg, data)}`, 'color: green; font-weight: bold']);
	}

	private buildLogArray(msg?: string, data?): string {
		const name = this.src instanceof String || typeof this.src === "string" ? this.src : this.src.name;
		return `[${name}] >>>> ${msg} ${data && data.length > 0 ? 
			data.map(it => {
				return it.constructor.name === 'Object' ? JSON.stringify(it, null,2): it;
			}): ""}`;
	}
	
	
	private consoleLog(msg: any[]) {

		if (this.appContext.withinCordova) {
			this.writeLog(msg[0].substring(2));
		}
		console.log.apply(console, msg);
	}

	private getLogFile(): Promise<FileEntry> {
		if (this.logFile != null) {
			return Promise.resolve(this.logFile);
		}

		return Container.get(FileService).getRootPath().then(rootDir => {
			return new Promise<FileEntry>((res, rej) => {
				rootDir.getFile(CONSOLE_LOG, { create: true, exclusive: false}, file => {
					this.logFile = file;
					res(file);
				}, e => rej(e));
			});			
		})
	}

	private writeLog(msg: string) {
		this.getLogFile().then(logFile => {
			logFile.createWriter(writer => {
				writer.seek(writer.length);
				writer.write(new Blob([msg + '\r\n'], {type: 'text/plain'}));
			});
		});
	}
}
