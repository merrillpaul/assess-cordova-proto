import { Inject, Service } from 'typedi';

import { AppContext } from '@assess/app-context';
import { NewContentVersion } from '@assess/content/dto';
import { FileService } from '@assess/services/file-service';
import { HttpService } from '@assess/shared/http/http-service';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';

import config from '@appEnvironment';
import { AxiosResponse } from 'axios';


@Service()
export class ContentUtilsService {
    
    @Inject()
    private appContext: AppContext;

    @Inject()
    private fileService: FileService;

    @Inject()
    private httpService: HttpService

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
        const url = contentVersion.path ? config.centralEndpoint +  contentVersion.path : contentVersion.url;
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

        const url = contentVersion.path ? config.centralEndpoint +  contentVersion.path : contentVersion.url;
        this.logger.info(`Downloading content from ${url}  for ${contentVersion.displayName}`, contentVersion.versionWithType);
        return this.httpService.getRequest().get(url , {
            responseType: 'blob'
        }); /*.then(response => {
            this.logger.info(`Downloaded  ${url} ${ response.data.size } for ${contentVersion.displayName}`, contentVersion.versionWithType);
            if (!this.appContext.withinCordova) {
                return Promise.all([response.data, null]);
            } else {
                return Promise.all([response.data, this.fileService.getContentArchiveDir()])
            }
        }).then(results => {
            const blob = results[0];
            if (!results[1]) {
                return null;
            } else {
                const tmpDir: DirectoryEntry = results[1] as DirectoryEntry;
                return this.fileService.writeFile(tmpDir, `${contentVersion.versionWithType}.tar`, blob); 
            }         
        }).then((file) => {
           return true;
        });*/
    }

    public writeToContentArchive(contentVersion: NewContentVersion, blob: Blob) {
        return  this.fileService.getContentArchiveDir().then(contentDir => {
            return this.fileService.writeFile(contentDir, `${contentVersion.versionWithType}.tar`, blob);
        });
    }

}