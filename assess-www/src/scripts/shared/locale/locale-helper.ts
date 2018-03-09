import { AppContext } from '@assess/app-context';
import { FileService } from '@assess/shared/file/file-service';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';
import { Inject, Service } from 'typedi';

@Service()
export class LocaleHelperService {

    @Inject()
    private appContext: AppContext;

    @Logger()
    private logger: LoggingService;

    private supportedLanguages: string[];

    @Inject()
    private fileService: FileService;

    public getHomeLocalized(): Promise<string> {
        if ( this.appContext.withinCordova ) {
            return Promise.resolve('http://localhost/give/homeUI_en.html'); // for local dev
        }
        return this.fileService.getContentWwwDir()
        .then((wwwDir: DirectoryEntry ) => {
            return Promise.all([wwwDir.nativeURL, this.getLanguageCodeForHomeUI()]);
        }).then (results => {
            const nativeUrl = results[0];
            const langCode = results[1];
            return `${nativeUrl}homeUI_${langCode}.html`;
        });
    }

    public getStimLocalized(): Promise<string> {
        if ( this.appContext.withinCordova ) {
            return Promise.resolve('http://localhost/give/stimPad_en.html'); // for local dev
        }
        return this.fileService.getContentWwwDir()
        .then((wwwDir: DirectoryEntry ) => {
            return Promise.all([wwwDir.nativeURL, this.getLanguageCodeForHomeUI()]);
        }).then (results => {
            const nativeUrl = results[0];
            const langCode = results[1];
            return `${nativeUrl}stimPad_${langCode}.html`;
        });
    }

    public getLanguageCodeForHomeUI(): Promise<string> {
        if ( this.appContext.withinCordova ) {
            return Promise.resolve('en');
        }

        return this.getSupportedLanguages()
        .then(langs => {
            const preferredLangs = window.navigator.languages;
            for (let i = 0, len = preferredLangs.length; i < len ; i++) {
                if (langs.indexOf(preferredLangs[i]) !== -1) {
                    return preferredLangs[i];
                }
            }
            return 'en';
        });
    }

    private getSupportedLanguages(): Promise<string[]> {

        if (this.supportedLanguages && this.supportedLanguages.length > 0) {
            return Promise.resolve(this.supportedLanguages);
        }
        const REGEX:RegExp = /^(messages_)([a-zA-Z]+)\.json$/i;
        return this.fileService.getContentWwwDir()
        .then(wwwDir => {
            return new Promise<string[]>((res, rej) => {
                wwwDir.getDirectory('i18n', {}, dir => {
                    this.logger.debug(`Getting list of files from ${dir.toInternalURL()}`);
                    const reader = dir.createReader();  
                    let i18nmessageFiles: string[] = [];
                    const readEntries = () => {
                        reader.readEntries(entries => {
                        if (!entries.length) {
                            this.logger.debug(`Got tars  ${i18nmessageFiles.length}`);
                            res(i18nmessageFiles);
                        } else {
                            i18nmessageFiles = i18nmessageFiles.concat(entries.map(it => it.name).filter((it) => {
                                return (REGEX).test(it);
                            })).map(it => REGEX.exec(it)[2]);
                            readEntries();
                        }
                        }, e => rej(e));
                    };
                    readEntries();
                }, e => rej(e))
            });            
        });
    }
}