import { AppContext } from '@assess/app-context';
import { FileService } from '@assess/shared/file/file-service';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';
import { Inject, Service } from 'typedi';

const GIVE_WWW = 'give-www';

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
        if ( !this.appContext.withinCordova ) {
            return Promise.resolve('http://localhost/give/homeUI_en.html'); // for local dev
        }
        return this.fileService.getContentWwwDir()
        .then((wwwDir: DirectoryEntry ) => {
            return Promise.all([wwwDir, this.getLanguageCodeForHomeUI()]);
        }).then (results => {
            const wwwDir = results[0];
            const langCode = results[1];
            return new Promise<string>((res, rej) => {
                wwwDir.getFile(`${GIVE_WWW}/homeUI_${langCode}.html`, { create: false },  file => {
                    res(file.toInternalURL());
                }, e => rej(e));
            });            
        });
    }

    public getStimLocalized(): Promise<string> {
        if ( !this.appContext.withinCordova ) {
            return Promise.resolve('http://localhost/give/stimPad_en.html'); // for local dev
        }
        return this.fileService.getContentWwwDir()
        .then((wwwDir: DirectoryEntry ) => {
            return Promise.all([wwwDir, this.getLanguageCodeForHomeUI()]);
        }).then (results => {
            const wwwDir = results[0];
            const langCode = results[1];
            return new Promise<string>((res, rej) => {
                wwwDir.getFile(`${GIVE_WWW}/stimPad_${langCode}.html`, { create: false },  file => {
                    res(file.toInternalURL());
                }, e => rej(e));
            });            
        });
    }

    public getLanguageCodeForHomeUI(): Promise<string> {
        if ( !this.appContext.withinCordova ) {
            return Promise.resolve('en');
        }

        return this.getSupportedLanguages()
        .then(langs => {
            // TODO this is actually not right. in IOS is different, refer GiveLocalHelper.m
            // this actually uses NSLocale preferredLanguages. We might need to add a localeplugin
            // which retrieves this.
            const preferredLangs = window.navigator.language;
            if (langs.indexOf(preferredLangs) !== -1) {
                    return preferredLangs;
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
                wwwDir.getDirectory(`${GIVE_WWW}/i18n`, {}, dir => {
                    this.logger.debug(`Getting list of files from ${dir.toInternalURL()}`);
                    const reader = dir.createReader();  
                    let i18nmessageFiles: string[] = [];
                    const readEntries = () => {
                        reader.readEntries(entries => {
                        if (!entries.length) {
                            this.logger.debug(`Got i18ns  ${i18nmessageFiles.length}`);
                            this.supportedLanguages = i18nmessageFiles;
                            res(i18nmessageFiles);
                        } else {
                            i18nmessageFiles = i18nmessageFiles.concat(entries.map(it => it.name).filter((it) => {
                                return (REGEX).test(it);
                            })).map(it => REGEX.exec(it)[2].toLowerCase());
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