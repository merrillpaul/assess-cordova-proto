import { AxiosResponse } from 'axios';
import { Container, Inject, Service } from "typedi";

import { AppContext } from '@assess/app-context';
import { startContentDownload } from '@assess/content/actions';
import constants from '@assess/content/constants';
import { IContentQueryState, ITarDownloadState, NewContentVersion, QueryVersionStatus } from '@assess/content/dto';
import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { QueryContentService } from '@assess/content/service/query-content-service';
import { FileService } from '@assess/shared/file/file-service';

import { delay } from 'redux-saga'
import { all, apply, call, put, take } from 'redux-saga/effects';

import { NewContentVersionPrompt } from '@assess/content/component/new-content/new-version-prompt';
import { ContentProgressOverlay } from '@assess/content/component/progress/progress-overlay';
import { ContentUtilsService } from '@assess/content/service/content-utils-service';
import { I18n } from '@assess/i18n/i18n';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';

@Service()
export class ContentDownloadSaga {

    @Inject()
    private fileService: FileService

    @Inject()
    private appContext: AppContext;

    @Inject()
    private queryContentService: QueryContentService;

    @Inject()
    private versionPrompt: NewContentVersionPrompt;

    @Inject()
    private contentUtilService: ContentUtilsService;
    
    @Inject()
    private provider: ContentStateProvider;

    @Inject()
    private spinner: LoginSpinnerOverlay;

    @Inject()
    private progress: ContentProgressOverlay;

    @Inject()
    private i18n: I18n;

    @Logger()
    private logger: LoggingService;

    /**
     * Kick starts our saga. First gets the version hashes
     * @param action redux action 
     */
    public *startSaga(action: any): IterableIterator<any> {
        yield put(startContentDownload());
        // get content of extractedHashes.json        
        try {
            yield put.resolve({type: constants.GET_HASHES, payload: this.fileService.getExtractedHashesFileContent()});
        } catch (error) {
                yield put({ type: constants.GET_HASHES_REJECTED, error});
        }       
    }

    /**
     * Gets the list of urls and other attrs needed to download content
     * @param action 
     */
    public *startQueryVersionSaga(action: any): IterableIterator<any> {
        // then call queryVersion
        yield call([this.spinner, this.spinner.updateTemplate], { data: {message: this.i18n.getMessage('give.content.query')}});
        yield put({type: constants.QUERY_VERSION_PENDING});
        try {
            const queryVersionResult = yield call([this.queryContentService, 
                this.queryContentService.queryVersion], action.payload);
            yield apply(this.spinner, this.spinner.dispose);
            yield put({type: constants.QUERY_VERSION_FULFILLED, queryVersionResult});

        } catch(error) {
            yield put({type: constants.QUERY_VERSION_REJECTED, error});
            yield apply(this.spinner, this.spinner.dispose);  
            yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, error});
                    
        }
        yield put({type: constants.QUERY_VERSION_COMPLETED});
    }


    /**
     * Starts our content download with urls
     * @param action 
     */
    public *startPostQueryVersion(): IterableIterator<any> {
        const contentQueryResult: IContentQueryState = this.provider.getQueryContentResult();
        switch(contentQueryResult.contentQueryStatus) {

            case QueryVersionStatus.SUCCESS_WITH_NEW_VERSIONS:
                try {
                    yield call([this.contentUtilService, this.contentUtilService.recreateTarExtractTmpDir]);
                    const canLaunchAssess = yield apply(this.contentUtilService, this.contentUtilService.canLaunchAssess);
                    // we ask for prompt
                    const totalSizeInBytes = contentQueryResult.downloadsNeeded.map(it => it.size || 0).reduce((prev, el) => prev + el);
                    if ( canLaunchAssess ) {
                        const dialogResult = yield apply(this.versionPrompt, this.versionPrompt.showPrompt, [contentQueryResult.downloadsNeeded]);
                        if (dialogResult === 'yes') {
                            yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult, totalSizeInBytes});
                            this.logger.success("Query versions received. Will download tars");
                        } else {
                            yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED});
                        }
                    } else {
                        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult, totalSizeInBytes});
                    }
                } catch(error) {
                    this.logger.error("Error in start post query", error);
                    yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, error});
                }

                break;

            case QueryVersionStatus.SUCCESS_WITH_NO_NEW_VERSION:
                this.logger.warn('Content query with no new versions');
                yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED});
                break;

            default:
                yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED});
                break;
        }
    }


    public *startDownloadTars(action: any): IterableIterator<any> {
        const contentQueryResult: IContentQueryState = action.contentQueryResult; 
        const totalSizeInBytes = action.totalSizeInBytes;  
        yield call([this.progress, this.progress.show]);
        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_START, contentQueryResult, totalSizeInBytes});
        let downloadedSize: number = 0;      
        
        for (let i = 0, len = contentQueryResult.downloadsNeeded.length; i < len; i++) {
            const newVersion: NewContentVersion = contentQueryResult.downloadsNeeded[i];
            yield put({type: constants.CONTENT_DOWNLOAD_TAR_STARTED, index: i});

            try {
                downloadedSize += newVersion.size;
                yield call([this, this.download], newVersion);                
            } catch (error) {
                this.logger.error(`Error in downloading tar for ${newVersion}, ${JSON.stringify(error, null, 4)}`);
                yield put({type: constants.CONTENT_DOWNLOAD_TAR_REJECTED, currentVersion: newVersion});
            }
        }

        this.logger.success("Download tars to content archive done");
        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_FINISHED});        
    }

    
    public *startExtraction(action: any): IterableIterator<any> {
        const tarDownloadResult: ITarDownloadState = this.provider.getTarDownloadResult();
        const extractedHashes: any = this.provider.getQueryContentResult().extractedHashes;
        
        // start CONTENT_EXTRACT_SAGA_TAR_STARTED
        yield put({downloadedVersions: tarDownloadResult.completedDownloads, extractedHashes, 
            type: constants.CONTENT_EXTRACT_SAGA_TAR_STARTED});
        yield apply(this.progress, this.progress.startInstall);

        const tarsToExtract: string[] = this.appContext.withinCordova ? 
            yield apply(this.fileService, this.fileService.getContentDirTarFileNames) :
            // mock for browser
            tarDownloadResult.completedDownloads.map(it => `${it.versionWithType}.tar`);
        
        yield put({tarsToExtract, type: constants.CONTENT_EXTRACT_TAR_LIST_FULFILLED});

        for (let i = 0, len = tarsToExtract.length; i < len; i++) {
            const tarfileName: string = tarsToExtract[i];
            yield put({type: constants.CONTENT_EXTRACT_TAR_STARTED, index: i});
            this.logger.debug(`Tar to extract ${tarfileName}`);
            try {
                if (this.appContext.withinCordova) {
                    yield apply (this.contentUtilService, this.contentUtilService.extractTar, [tarfileName]);
                } else { // mock for browser
                    yield delay(100);
                }
                yield put({currentTar: tarfileName, type: constants.CONTENT_EXTRACT_TAR_FINISHED});
            } catch (error) {
                this.logger.error(`Error in extracting tar for`, tarfileName);
                yield put({type: constants.CONTENT_EXTRACT_TAR_REJECTED, currentTar: tarfileName});
            }
        }

        this.logger.success("Extract/Installing content tars done");
        yield put({type: constants.CONTENT_EXTRACT_SAGA_TAR_FINISHED});
        
    }

    public *afterTarExtraction(): IterableIterator<any> {
        const hashes: any = this.provider.getTarExtractionResult().extractedHashes;
        yield apply(this.contentUtilService, this.contentUtilService.updateContentWwwDir);
        yield apply(this.fileService, this.fileService.writeExtractedHashes, [hashes]);
        yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED}); 
    }

    private *download(newVersion: NewContentVersion) {
        const channel = this.appContext.withinCordova ?
            yield apply (this.contentUtilService, this.contentUtilService.downloadTar, [newVersion]) :
            yield apply (this.contentUtilService, this.contentUtilService.downloadTarUrl, [newVersion]);             
        
        while(true) {
            yield put(yield take(channel));
        }
    }
}