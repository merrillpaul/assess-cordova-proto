import { STARTUP_ACTIONS } from '@assess/app-constants';
import { I18n } from '@assess/i18n/i18n';
import { LoginStateProvider } from '@assess/login/reducers/state-provider';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';
import constants from '@assess/mfa/constants';
import { MfaStateProvider } from '@assess/mfa/reducers/mfa-state-provider';
import { MfaService } from '@assess/mfa/service/mfa-service';
import { Dialog } from '@assess/shared/dialog/dialog';
import { LoginUserInfo } from '@assess/shared/dto/login-state';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';
import { AuthService } from '@assess/shared/security/auth-service';
import { apply, call, put } from 'redux-saga/effects';
import { Container, Inject, Service } from 'typedi';

@Service()
export class MfaSaga {

    @Inject()
    private authService: AuthService;

    @Logger()
    private logger: LoggingService;

    @Inject()
    private i18n: I18n;

    @Inject()
    private dialog: Dialog;

    @Inject()
    private loginProvider: LoginStateProvider;

    @Inject()
    private mfaProvider: MfaStateProvider;

    @Inject()
    private mfaService: MfaService;

    @Inject()
    private spinner: LoginSpinnerOverlay;

    /**
     * Generator that kick starts the login process
     * @param action 
     */
    public *startMfaSaga(action: any): IterableIterator<any> {
        const userInfo: LoginUserInfo = action.loginResult;
        if (!userInfo.mfaDetails.mfaVerified) {
            this.logger.warn('Needs mfa but user has not set it up');
            this.dialog.alert(this.i18n.getMessage('give.login.auth.error.mfa.not.setup.description'), 
                `${this.i18n.getMessage('give.login.auth.error.mfa.not.setup.reason')} ${this.i18n.getMessage('give.login.auth.error.mfa.not.setup.suggestion')}`
            );
        } else {
            yield put({type: STARTUP_ACTIONS.SHOW_MFA});
        }
    }

    public *requestOtp(action: any): IterableIterator<any> {
        const mfaType: string = action.mfaType;
        this.logger.info(`Requesting OTP for ${mfaType}`);
        yield put.resolve({payload: this.mfaService.triggerOTP(
            mfaType, this.loginProvider.getUserInfo().mfaDetails.typeFldName),type: constants.TRIGGER_OTP});
    }

    public *login(action: any): IterableIterator<any> {
        const mfaType: string = action.mfaType;
        const mfaCode: string = action.mfaCode;
        this.logger.info(`Logging in with MFA for ${mfaType}`);
        this.spinner.show();
        yield put({type: constants.MFA_REQUEST_PENDING});
        try {
            const response = yield call([this.mfaService, this.mfaService.login], mfaType, mfaCode, this.loginProvider.getUserInfo().mfaDetails);
            if(!response) {                
                yield put({mfaSuccess: false, type: constants.MFA_REQUEST_REJECTED, errors: [this.i18n.getMessage('give.mfa.error.invalid.code')]});
            } else {
                yield put({mfaSuccess: true, type: constants.MFA_REQUEST_FULFILLED, errors: []});
            }
            this.spinner.dispose();
        } catch(error) {
            yield put({mfaSuccess: false, type: constants.MFA_REQUEST_REJECTED});
            this.spinner.dispose();
        }
    }
}