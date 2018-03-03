import { Container, Inject, Service } from "typedi";

import { startContentDownload } from '@assess/content/actions';
import constants from '@assess/content/constants';
import { IContentQueryState, NewContentVersion, QueryVersionStatus } from '@assess/content/dto';
import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { QueryContentService } from '@assess/content/service/query-content-service';
import { FileService } from '@assess/services/file-service';

import { delay } from 'redux-saga'
import { apply, call, put } from 'redux-saga/effects';

import { NewContentVersionPrompt } from '@assess/content/component/new-content/new-version-prompt';
import { ContentProgressOverlay } from '@assess/content/component/progress/progress-overlay';
import { ContentUtilsService } from '@assess/content/service/content-utils-service';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';

@Service()
export class ContentDownloadSaga {

    @Inject()
    private fileService: FileService

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
        yield call([this.spinner, this.spinner.updateMessage], 'Please wait a moment while Assess gets any new content')
        yield put({type: constants.QUERY_VERSION_PENDING});
        try {
            const queryVersionResult = yield call([this.queryContentService, this.queryContentService.queryVersion], action.payload);
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
                    // yield call([this.contentUtilService, this.contentUtilService.recreateTarExtractTmpDir]);
                    const canLaunchAssess = yield apply(this.contentUtilService, this.contentUtilService.canLaunchAssess);
                    // we ask for prompt
                    const totalSizeInBytes = contentQueryResult.downloadsNeeded.map(it => it.size || 0).reduce((prev, el) => prev + el);
                    const totalSizeInText: string = this.fileService.getSizeDescription(totalSizeInBytes);
                    if ( canLaunchAssess ) {
                        const dialogResult = yield apply(this.versionPrompt, this.versionPrompt.showPrompt, [contentQueryResult.downloadsNeeded]);
                        if (dialogResult === 'yes') {
                            yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult, totalSizeInText});
                            this.logger.success("Query versions received. Will download tars");
                        } else {
                            yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, contentQueryResult});
                        }
                    } else {
                        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult, totalSizeInText});
                    }
                } catch(error) {
                    this.logger.error("Error in start post query", error);
                    yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, error});
                }

            break;

            default:
                yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, contentQueryResult});
                break;
        }
    }


    public *startDownloadTars(action: any): IterableIterator<any> {
        const contentQueryResult: IContentQueryState = action.contentQueryResult; 
        const totalSizeInText = action.totalSizeInText;  
        yield call([this.progress, this.progress.show]);
        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_START, contentQueryResult, totalSizeInText});
        let downloadedSize: number = 0;      
        
        for (let i = 0, len = contentQueryResult.downloadsNeeded.length; i < len; i++) {
            const newVersion: NewContentVersion = contentQueryResult.downloadsNeeded[i];
            yield put({type: constants.CONTENT_DOWNLOAD_TAR_STARTED, index: i});

            try {
                downloadedSize += newVersion.size;
                const downloadTarResult = yield apply (this.contentUtilService, this.contentUtilService.downloadTarToArchiveDir, [newVersion]);
                yield put({type: constants.CONTENT_DOWNLOAD_TAR_FINISHED, currentVersion: newVersion, downloadedSize: this.fileService.getSizeDescription(downloadedSize)});
            } catch (error) {
                this.logger.error(`Error in downloading tar for`, newVersion);
                yield put({type: constants.CONTENT_DOWNLOAD_TAR_REJECTED, currentVersion: newVersion});
            }        
            yield delay(100);
        }

        this.logger.success("Download tars to content archive done");
        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_FINISHED});        
    }
}