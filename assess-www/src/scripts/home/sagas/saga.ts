import { ContentProgressOverlay } from '@assess/content/component/progress/progress-overlay';
import constants from '@assess/home/constants';
import { ILaunchState } from '@assess/home/dto';
import { I18n } from '@assess/i18n/i18n';
import { Dialog } from '@assess/shared/dialog/dialog';
import { FileService } from '@assess/shared/file/file-service';
import { LocaleHelperService } from '@assess/shared/locale/locale-helper';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';
import { call, put } from 'redux-saga/effects';
import { Inject, Service } from 'typedi';

@Service()
export class HomeSaga {

    @Inject()
    private dialog: Dialog;

    @Inject()
    private i18n: I18n;

    @Inject()
    private fileService: FileService;

    @Inject()
    private progress: ContentProgressOverlay;

    @Logger()
    private logger: LoggingService;

    @Inject()
    private localeHelper: LocaleHelperService;
    
    /**
     * These conditions are copied from MainViewController.m
     * + (void)contentZipUtils:(ContentZipUtils *)sender finishedWithResult:(ContentZipResult)result 
     * @param launchState 
     */
    public *finishWithResult(launchState: ILaunchState) : IterableIterator<any> {
        this.progress.dispose();
        if (launchState.platformUpdateNeeded) {
            if (launchState.canLaunchGive) {
                yield call([this.dialog, this.dialog.alert], this.i18n.getMessage('give.content.old.platform.title'), 
                    this.i18n.getMessage('give.content.old.platform'));
                yield put({type: constants.CHECK_INTERFACES});                
            } else {
                yield call([this.dialog, this.dialog.alert], this.i18n.getMessage('give.content.must.update.title'), 
                    this.i18n.getMessage('give.content.must.update'));
            }
        } else if (!launchState.canLaunchGive) {
            if (launchState.failedDownloading) {
                yield call([this.dialog, this.dialog.alert], this.i18n.getMessage('give.content.generic.error.title'), 
                    this.i18n.getMessage('give.content.generic.error'));
            } else {
                yield call([this.dialog, this.dialog.alert], this.i18n.getMessage('give.content.generic.error.title'), 
                    this.i18n.getMessage('give.content.no-content.error'));
            }
        } else if (launchState.failedDownloading) {
            yield call([this.dialog, this.dialog.alert], this.i18n.getMessage('give.content.generic.error.title'), 
                    this.i18n.getMessage('give.content.cannot.check.run.old'));
            yield put({type: constants.CHECK_INTERFACES});
        } else {
            yield put({type: constants.CHECK_INTERFACES});
        }
    }


    public *performInterfaceCheckAndLaunchGive(): IterableIterator<any> {
        // need to copy platform cordova js's into give-www/bower_components/cordova
        yield call([this.fileService, this.fileService.copyCordovaJs]);
        this.logger.debug('Copied over platform specific cordova JS to assess give-www');
        const targetPage = yield call([this.localeHelper, this.localeHelper.getHomeLocalized]);
        this.logger.success(`Will forward to ${targetPage}`);
    }
}