import { STARTUP_ACTIONS } from '@assess/app-constants';
import { I18n } from '@assess/i18n/i18n';
import constants from '@assess/mfa/constants';
import { Dialog } from '@assess/shared/dialog/dialog';
import { LoginUserInfo } from '@assess/shared/dto/login-state';
import { Logger, LoggingService } from '@assess/shared/log/logging-service';
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

    /**
     * Generator that kick starts the login process
     * @param action 
     */
    public *startMfaSaga(action: any): IterableIterator<any> {
        const userInfo: LoginUserInfo = action.loginResult;
        // this.logger.info('action with userinfo ', userInfo);

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
    }
}