import { Container, Inject, Service } from "typedi";

import { startContentDownload } from '@assess/content/actions';
import constants from '@assess/content/constants';
import { IContentQueryState, QueryVersionStatus } from '@assess/content/dto';
import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { QueryContentService } from '@assess/content/service/query-content-service';
import { FileService } from '@assess/services/file-service';

import { apply, call, put } from 'redux-saga/effects';

import { NewContentVersionPrompt } from '@assess/content/component/new-content/new-version-prompt';
import { ContentUtilsService } from '@assess/content/service/content-utils-service';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';


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
                    yield call([this.contentUtilService, this.contentUtilService.recreateTarExtractTmpDir]);
                    const canLaunchAssess = yield apply(this.contentUtilService, this.contentUtilService.canLaunchAssess);
                    // we ask for prompt
                    if ( canLaunchAssess ) {
                        const dialogResult = yield apply(this.versionPrompt, this.versionPrompt.showPrompt, [contentQueryResult.downloadsNeeded]);
                        if (dialogResult === 'yes') {
                            yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult});
                        } else {
                            yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, contentQueryResult});
                        }
                    } else {
                        yield put({type: constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentQueryResult});
                    }
                } catch(error) {
                    yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, error});
                }

            break;

            default:
                yield put({type: constants.CONTENT_DOWNLOAD_SAGA_FINISHED, contentQueryResult});
                break;
        }
    }
}