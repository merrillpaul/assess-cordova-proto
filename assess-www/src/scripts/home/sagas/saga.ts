import { AppContext } from '@assess/app-context';
import { ContentProgressOverlay } from '@assess/content/component/progress/progress-overlay';
import constants from '@assess/home/constants';
import { ILaunchState } from '@assess/home/dto';
import { I18n } from '@assess/i18n/i18n';
import { AppPreferences } from '@assess/shared/config/app-preferences';
import { Dialog } from '@assess/shared/dialog/dialog';
import { FileService } from '@assess/shared/file/file-service';
import { LocaleHelperService } from '@assess/shared/locale/locale-helper';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';

import { call, put } from 'redux-saga/effects';
import { Inject, Service } from 'typedi';


const GIVE_WWW = 'give-www';

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

    @Inject()
    private appContext: AppContext;

    @Inject()
    private appPreferences: AppPreferences;
    
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
        const debugUrl = yield call([this, this.getDebugPlaceholderLocation]);
        let targetPart;
        if (this.appContext.withinCordova) {
            const isPractitioner = yield call([this.appPreferences, this.appPreferences.isPractitioner]);
            targetPart = isPractitioner ? yield call([this.localeHelper, this.localeHelper.getHomeLocalized]) 
                : yield call([this.localeHelper, this.localeHelper.getStimLocalized]);           
        } else {
            targetPart = yield call([this.localeHelper, this.localeHelper.getHomeLocalized]);
        }
        // refer MainViewController.m #640
        const targetPage = `${debugUrl}?dest=${targetPart}`;
        // alert(`Will forward to ${targetPage}`);
        this.logger.success(`Will forward to ${targetPage}`);
        window.location.href = targetPage;
    }

    private getDebugPlaceholderLocation(): Promise<string> {
        
        if ( !this.appContext.withinCordova ) {
            return Promise.resolve('http://localhost/give/debugLoadPlaceholder.html'); // for local dev
        }
        return this.fileService.getContentWwwDir()
        .then((wwwDir: DirectoryEntry ) => {
            this.logger.debug(`getDebugplaceholder got content www dir as ${wwwDir.toInternalURL()}`);
            return new Promise<string>((res, rej) => {
                wwwDir.getFile(`${GIVE_WWW}/debugLoadPlaceholder.html`, { create: false },  file => {
                    this.logger.debug(`Yep we have the debugLoadPlaceholder @ ${file.toInternalURL()}`);
                    res(file.toInternalURL());
                }, e => {
                    this.logger.error(`Seems a problem with ${e} ${JSON.stringify(e)}`);
                    rej(e);
                });
            });   
        });     
    }
}