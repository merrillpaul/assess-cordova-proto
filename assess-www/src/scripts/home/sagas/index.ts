import contentConstants from '@assess/content/constants';
import { IContentQueryState, ITarDownloadState, QueryVersionStatus } from '@assess/content/dto';
import { ContentStateProvider } from '@assess/content/reducers/content-state-provider';
import { ContentUtilsService } from '@assess/content/service/content-utils-service';
import { ILaunchState } from '@assess/home/dto';
import { HomeSaga } from '@assess/home/sagas/saga';
import loginConstants  from '@assess/login/constants';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';

import { all, apply, call, put, takeLatest } from 'redux-saga/effects';
import { Container, Inject, Service } from 'typedi';


@Service()
class HomeSagaWatcher {

    @Logger()
    private logger: LoggingService;

    @Inject()
    private contentStateProvider: ContentStateProvider;

    @Inject()
    private contentUtilsService: ContentUtilsService;

    @Inject()
    private homeSaga: HomeSaga;

    
    public *watchForContentDone() {
        yield takeLatest(contentConstants.CONTENT_DOWNLOAD_SAGA_FINISHED, this.preAssessChecks.bind(this));
    }

    private *preAssessChecks(action: any) {
        const contentQueryState: IContentQueryState = this.contentStateProvider.getQueryContentResult();
        
        const launchState: ILaunchState = {
            canLaunchGive: false,
            failedDownloading: false,
            platformUpdateNeeded: false
        };

        const response = yield call([this.contentUtilsService, this.contentUtilsService.canLaunchAssess]);
        launchState.canLaunchGive = response;

        switch (contentQueryState.contentQueryStatus) {
            case QueryVersionStatus.FAILED:
            case QueryVersionStatus.FAILED_HASHES:
            case QueryVersionStatus.INVALID_URL:
                launchState.failedDownloading = true;
                break;

            case QueryVersionStatus.UPDATE_NEEDED:
                launchState.platformUpdateNeeded = true;
                break;
        }
        yield call([this.homeSaga, this.homeSaga.finishWithResult], launchState);
    }
}

export default function* homeRootSaga() {
    const watcher: HomeSagaWatcher = Container.get(HomeSagaWatcher);
    yield all([
        watcher.watchForContentDone.bind(watcher)()
    ]);
} 