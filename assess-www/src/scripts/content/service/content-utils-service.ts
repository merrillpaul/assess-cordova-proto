import { AxiosResponse } from 'axios';
import * as untar from 'js-untar';
import { Channel, END, eventChannel } from 'redux-saga';
import { Observable, Subject } from 'rxjs';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import constants from '@assess/content/constants';
import { NewContentVersion } from '@assess/content/dto';
import { ConfigService } from '@assess/shared/config/config-service';
import { FileService } from '@assess/shared/file/file-service';
import { HttpService } from '@assess/shared/http/http-service';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';

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

    @Logger()
    private logger: LoggingService

    public recreateTarExtractTmpDir(): Promise<boolean> {
       return this.fileService.recreateZipExractTmpDir();
    }

    /**
     * This should actually check whether there is any content in our Content root.
     * So that it will cause the prompt. FOr the moment always true
     */
    public canLaunchAssess(): Promise<boolean> {
        // this should always res with true or false
        return Promise.resolve(true);
    }


    public downloadTar(contentVersion: NewContentVersion): Channel<any> {
        const url = contentVersion.path ? this.configService.getConfig().centralEndpoint + 
            contentVersion.path : contentVersion.url;
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

            return () => {                
                this.logger.warn(`Download progress monitor`);
            }
        });        
    }

    /**
     * Plain download for mock in browser to showcase progress
     * @param contentVersion 
     */
    public downloadTarUrl(contentVersion: NewContentVersion): Channel<any> {
        
        const url = contentVersion.path ? this.configService.getConfig().centralEndpoint +  
            contentVersion.path : contentVersion.url;
        this.logger.info(`Downloading content from ${url}  for ${contentVersion.displayName}`, contentVersion.versionWithType);
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
            const request = this.httpService.getRequest().get(url, {
                onDownloadProgress: (progressEvent: ProgressEvent) => {
                    progressSubject.next(progressEvent);
                },
                responseType: 'blob'                
            }).then (res => {
                progressSubject.complete();
                emitter({
                    currentVersion: contentVersion,
                    type: constants.CONTENT_DOWNLOAD_TAR_FINISHED,
                });
                emitter(END);
            }).catch(e =>  { progressSubject.complete(); throw e; });

            return () => {
                this.logger.warn(`Download progress monitor`);
            }
        });        
    }

    public writeToContentArchive(contentVersion: NewContentVersion, blob: Blob) {
        return  this.fileService.getContentArchiveDir().then(contentDir => {
            return this.fileService.writeFile(contentDir, `${contentVersion.versionWithType}.tar`, blob);
        });
    }

    /**
     * Extracts tar from content archive dir to content www folder
     * @param tarfileName 
     */
    public extractTar(tarfileName: string): Promise<boolean> {          

        return this.fileService.getContentArchiveDir()
        .then(archiveDir => {
            return `${archiveDir.toInternalURL()}${tarfileName}`;
        }).then(tarFilePath => {
            return Promise.all([tarFilePath, this.fileService.getContentWwwDir()]);
        }).then(results => {
            const tarFilePath: string = results[0];
            const contentWwwDir: DirectoryEntry = results[1];
            return this.untar(tarFilePath, contentWwwDir);
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
                    throw `Error in untarring ${tarfilePath} `;
                }
            });
        });        
    }

}