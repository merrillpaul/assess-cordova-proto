import constants from '@assess/home/constants';
import { ILaunchState } from '@assess/home/dto';
import { I18n } from '@assess/i18n/i18n';
import { Dialog } from '@assess/shared/dialog/dialog';
import { call, put } from 'redux-saga/effects';
import { Inject, Service } from 'typedi';


@Service()
export class HomeSaga {

    @Inject()
    private dialog: Dialog;

    @Inject()
    private i18n: I18n;

    /**
     * These conditions are copied from MainViewController.m
     * + (void)contentZipUtils:(ContentZipUtils *)sender finishedWithResult:(ContentZipResult)result 
     * @param launchState 
     */
    public *finishWithResult(launchState: ILaunchState) : IterableIterator<any> {
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
}