import { AxiosResponse } from 'axios';
import * as untar from 'js-untar';
import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
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


    public downloadTar(contentVersion: NewContentVersion): Promise<boolean> {
        const url = contentVersion.path ? this.configService.getConfig().centralEndpoint + 
            contentVersion.path : contentVersion.url;
        return this.fileService.getZipExtractTmpDir()
        .then(tmpDir => {
            this.logger.debug(`Downloading  ${contentVersion}`);
            return this.fileService.downloadUrlToDir(url, `${contentVersion.versionWithType}.tar`, tmpDir);
        }).then(tmptarFile => {
            this.logger.debug(`Copying ${tmptarFile.toInternalURL()} to contentArchive`);
            return this.fileService.copyToContentArchiveDir(tmptarFile);
        }).then(() => true);
    }

    public downloadTarUrl(contentVersion: NewContentVersion): Promise<AxiosResponse> {

        const url = contentVersion.path ? this.configService.getConfig().centralEndpoint +  
            contentVersion.path : contentVersion.url;
        this.logger.info(`Downloading content from ${url}  for ${contentVersion.displayName}`, contentVersion.versionWithType);
        return this.httpService.getRequest().get(url , {
            responseType: 'blob'
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

        return this.fileService.getContentArchiveDir().then(archiveDir => {
            return new Promise<ArrayBuffer>((res, rej) => {
                archiveDir.getFile(tarfileName, {}, tarFileEntry => {

                    this.logger.debug(`Reading tar file from ${tarFileEntry.toInternalURL()}`);
                    tarFileEntry.file(file => {
                        const reader: FileReader = new FileReader();
                        reader.onloadend = () => {
                            this.logger.success(`Got tar file contents from ${tarFileEntry.toInternalURL()}`);
                            res(reader.result);
                        };
                        reader.readAsArrayBuffer(file);
                    }, e => rej(e));                    
                }, e => rej(e));
            }); 
        }).then (arrayBuffer => {
            return Promise.all([arrayBuffer, this.fileService.getContentWwwDir()]);
        }).then(results => {
            const arrayBuffer: ArrayBuffer = results[0];
            const contentWwwDir: DirectoryEntry = results[1];
            return this.untar(arrayBuffer, contentWwwDir, tarfileName);
        });
    }

    private untar(data: ArrayBuffer, targetDir: DirectoryEntry, tarfilename: string): Promise<boolean> {
        this.logger.debug(`Starting to untar ${tarfilename}`);
        return new Promise<boolean>((res, rej) => {
            untar(data).then(
                (allFiles: UntarredFile[]) => {
                    const files = allFiles.filter (file => file.blob.size > 0).reverse();
                    // this nextfile mechanism is to make the file writing sequentially
                    // cause otherwise filewriting with html5 plugin complains if too many file calls
                    // are done parallelly. So we kind of twist the asynchronous to synchronous file writing, one by one.
                    const nextFile = () => {
                        // if we have more files to process
                        if (files.length > 0) {
                          writeFiles(files.pop() as UntarredFile);
                        } else {
                          this.logger.success(`Extracted tar ${tarfilename}`);
                          res(true);
                        }
                    };

                    const writeFiles = (file: UntarredFile) => {  
                        if (file) {
                          const filename = file.name.split('/').pop() as string;
                          this.fileService.createFileWithPath(targetDir, file.name, file.blob).subscribe(fileEntry => {                            
                            nextFile();
                          }, e => nextFile());   
                        }          
                    };
                    writeFiles(files.pop() as UntarredFile); 

                },
                e => {
                    rej(e);
                }
            );
        });
    }

}