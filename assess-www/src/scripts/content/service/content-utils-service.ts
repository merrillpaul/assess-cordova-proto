import { AxiosResponse } from 'axios';
import { Channel, END, eventChannel } from 'redux-saga';
import { Observable, Subject } from 'rxjs';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import constants from '@assess/content/constants';
import { INewContentVersion } from '@assess/content/dto';
import { ConfigService } from '@assess/shared/config/config-service';
import { FileService } from '@assess/shared/file/file-service';
import { HttpService } from '@assess/shared/http/http-service';
import { LocaleHelperService } from '@assess/shared/locale/locale-helper';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';

const ASSESS_GIVE_WWW: string = 'give-www';

@Service()
export class ContentUtilsService {
    
    @Inject()
    private appContext: AppContext;

    @Inject()
    private fileService: FileService;

    @Inject()
    private httpService: HttpService

    @Inject()
    private configService: ConfigService;

    @Inject()
    private localeHelper: LocaleHelperService;

    @Logger()
    private logger: LoggingService

    public recreateTarExtractTmpDir(): Promise<boolean> {
       return this.fileService.recreateZipExractTmpDir();
    }

    /**
     * This should actually check whether there is any content in our Content root.
     * So that it will cause the prompt.
     */
    public canLaunchAssess(): Promise<boolean> {
        // this should always res with true or false
        if (!this.appContext.withinCordova) {
            return Promise.resolve(true);
        }
        
        return new Promise<boolean>((res, rej) => {
            this.localeHelper.getHomeLocalized().then(() => res(true), e => res(false));
        });
    }


    public downloadTar(contentVersion: INewContentVersion): Channel<any> {
        
        return eventChannel(emitter => {
            const progressSubject = new Subject<ProgressEvent>();
            progressSubject
            .debounceTime(1000)
            .subscribe(progressEvent => {
                emitter({
                    currentVersion: contentVersion,
                    downloadedSize: progressEvent.loaded,
                    type: constants.CONTENT_DOWNLOAD_TAR_PROGRESS,
                });
            });
            this.configService.getConfig().then( conf => {
                    const url = contentVersion.path ? conf.centralEndpoint + 
                        contentVersion.path : contentVersion.url;

                    this.fileService.getZipExtractTmpDir()
                        .then(tmpDir => {
                            this.logger.debug(`Downloading  ${contentVersion}`);
                            return this.fileService.downloadUrlToDir(contentVersion, url, `${contentVersion.versionWithType}.tar`, tmpDir, 
                            (progressEvent: ProgressEvent) => {
                                progressSubject.next(progressEvent);
                            });
                        }).then(tmptarFile => {
                            this.logger.debug(`Copying ${tmptarFile.toInternalURL()} to contentArchive`);
                            return this.fileService.copyToContentArchiveDir(tmptarFile);
                        }).then(() => {
                            progressSubject.complete();
                            emitter({
                                currentVersion: contentVersion,
                                type: constants.CONTENT_DOWNLOAD_TAR_FINISHED,
                            });
                            emitter(END);
                        }).catch(e =>  { progressSubject.complete(); throw e; });
                }
            );           

            return () => {                
                this.logger.warn(`Download progress monitor`);
            }
        });        
    }

    /**
     * Plain download for mock in browser to showcase progress
     * @param contentVersion 
     */
    public downloadTarUrl(contentVersion: INewContentVersion): Channel<any> {     
       
       
        return eventChannel(emitter => {
            const progressSubject = new Subject<ProgressEvent>();
            progressSubject
            .debounceTime(1000)
            .subscribe(progressEvent => {
                emitter({
                    currentVersion: contentVersion,
                    downloadedSize: progressEvent.loaded,
                    type: constants.CONTENT_DOWNLOAD_TAR_PROGRESS,
                });
            });

            this.configService.getConfig().then( conf => {
                const url = contentVersion.path ? conf.centralEndpoint + 
                    contentVersion.path : contentVersion.url;
                this.logger.info(`Downloading content from ${url}  for ${contentVersion.displayName}`, contentVersion.versionWithType);
                this.httpService.get(url, {
                    onDownloadProgress: (progressEvent: ProgressEvent) => {
                        progressSubject.next(progressEvent);
                    },
                    responseType: 'blob'                
                }, true ).then (res => {
                    this.fileService.getContentArchiveDir()
                    .then(contentDir => {
                        return this.fileService.writeFile(contentDir, `${contentVersion.versionWithType}.tar`, res.data)
                        .then(() => {
                            progressSubject.complete();
                            this.logger.success(`Copied ${contentVersion.versionWithType}.tar to ${contentDir.toURL()}`);
                            emitter({
                                currentVersion: contentVersion,
                                type: constants.CONTENT_DOWNLOAD_TAR_FINISHED,
                            });
                            emitter(END);
                            return true;
                        });
                    }).catch(e => {
                        progressSubject.complete(); 
                        throw e;
                    });
                    


                }).catch(e =>  { progressSubject.complete(); throw e; });
            });
            
            return () => {
                this.logger.warn(`Download progress monitor`);
            }
        });        
    }

    public writeToContentArchive(contentVersion: INewContentVersion, blob: Blob) {
        return  this.fileService.getContentArchiveDir().then(contentDir => {
            return this.fileService.writeFile(contentDir, `${contentVersion.versionWithType}.tar`, blob);
        });
    }

    /**
     * Extracts tar from content archive dir to tmp zip arch folder
     * @param tarfileName 
     */
    public extractTar(tarfileName: string): Promise<boolean> {          

        return this.fileService.getContentArchiveDir()
        .then(archiveDir => {
            return `${archiveDir.toInternalURL()}${tarfileName}`;
        }).then(tarFilePath => {
            return Promise.all([tarFilePath, this.fileService.getZipExtractTmpDir()]);
        }).then(results => {
            const tarFilePath: string = results[0];
            const tmpZipDir: DirectoryEntry = results[1];
            return this.untar(tarFilePath, tmpZipDir);
        });

    }

    /**
     * Moves give-www folder from the tmpZip folder onto the content-www folder.
     * We first remove the give-www folder in content-www and then make the move, cause 
     */
    public updateContentWwwDir(): Promise<boolean> {
        if (!this.appContext.withinCordova) {
            return Promise.resolve(true);
        }
        return this.fileService.getContentWwwDir()
        .then(contentWwwDir => {
            return Promise.all([contentWwwDir, this.fileService.getZipExtractTmpDir()]);
        })
        .then(dirs => {
            const contentWwwDir: DirectoryEntry = dirs[0];
            const zipExtractTmpDir: DirectoryEntry = dirs[1];
            return Promise.all([
                contentWwwDir,
                new Promise<DirectoryEntry>((res, rej) => {
                    zipExtractTmpDir.getDirectory(ASSESS_GIVE_WWW, {}, giveWwwDir => res(giveWwwDir), e => rej(e));
                })
            ]);
        })
        .then(dirs => {
            const contentWwwDir: DirectoryEntry = dirs[0];
            const giveWWWFolder: DirectoryEntry = dirs[1];
            return Promise.all([contentWwwDir, giveWWWFolder, this.fileService.deleteFolderSilently(contentWwwDir, ASSESS_GIVE_WWW)]);
        }).
        then(results => {
            const contentWwwDir: DirectoryEntry = results[0];
            const giveWWWFolder: DirectoryEntry = results[1];
            return this.fileService.move(giveWWWFolder, contentWwwDir);
        })        
        .then(result => {
            if(result === false) {
                throw new Error("Error while moving tmp givewww to contentwww folder");
            }
            return true;
        });
    }

    private untar(tarfilePath: string, targetDir: DirectoryEntry): Promise<boolean> {
        this.logger.debug(`Starting to untar ${tarfilePath}`);
        const tarService: TarService = new TarService();
        return new Promise<boolean>((res, rej) => {
            tarService.untar(tarfilePath, targetDir.toInternalURL(), status => {
                if (status) {
                    res(true);
                } else {
                    throw new Error(`Error in untarring ${tarfilePath} `);
                }
            });
        });        
    }

}