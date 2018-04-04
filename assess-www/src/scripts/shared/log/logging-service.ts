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

	public getConsoleLog(): Promise<string> {
		if(!this.appContext.withinCordova) {
			return Promise.resolve(`
				Not within a device. Hence get your console logs from your browser's console window!
			`);
		}

		return this.getLogFile()
		.then(fileEntry => {
			const fileService = Container.get(FileService);
			return fileService.readAsTextFromFile(fileEntry);
		});
	}

	public clearConsoleLog(): Promise<boolean> {
		if(!this.appContext.withinCordova) {
			this.success('Fake clear console log');
			return Promise.resolve(true);
		}

		const fileService = Container.get(FileService);
		return fileService.getRootPath()
		.then(rootDir => {
			return fileService.writeFile(rootDir, CONSOLE_LOG, new Blob([''], { type: 'text/plain'}));
		})
		.then(() => true);
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
