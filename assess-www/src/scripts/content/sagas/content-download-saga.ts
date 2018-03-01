import { Container, Inject, Service } from "typedi";

import { startContentDownload } from '@assess/content/actions';
import { ContentQuerySpinnerOverlay } from '@assess/content/component/content-query-spinner';
import constants from '@assess/content/constants';
import { IContentQueryState, QueryVersionStatus } from '@assess/content/dto';
import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { QueryContentService } from '@assess/content/service/query-content-service';
import { FileService } from '@assess/services/file-service';

import { apply, call, put } from 'redux-saga/effects';

import { NewContentVersionPrompt } from '@assess/content/component/new-content/new-version-prompt';
import { ContentUtilsService } from '@assess/content/service/content-utils-service';


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
        const spinner = new ContentQuerySpinnerOverlay();
        yield apply(spinner, spinner.show);
        yield put({type: constants.QUERY_VERSION_PENDING});
        try {
            const queryVersionResult = yield call([this.queryContentService, this.queryContentService.queryVersion], action.payload);
            yield apply(spinner, spinner.dispose);
            yield put({type: constants.QUERY_VERSION_FULFILLED, queryVersionResult});

        } catch(error) {
            yield put({type: constants.QUERY_VERSION_REJECTED, error});
            yield apply(spinner, spinner.dispose);
            // TODO show error
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
                // const dialogResult = yield apply(this.versionPrompt, this.versionPrompt.showPrompt, [contentQueryResult.downloadsNeeded]);
                // console.log('dialog Result', dialogResult);
            break;

            default:
                yield put({type: constants.CONTENT_DOWNLOAD_FINISHED, contentQueryResult});
                break;
        }
    }
}