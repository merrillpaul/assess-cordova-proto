import { invalidPassword, invalidUsername } from '@assess/login/actions';
import constants from '@assess/login/constants';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';
import { AuthService } from '@assess/shared/security/auth-service';
import { Container, Inject, Service } from 'typedi';

import { apply, call, put } from 'redux-saga/effects';


@Service()
export class LoginSaga {

    @Inject()
    private authService: AuthService;

    @Inject()
    private loginSpinner: LoginSpinnerOverlay;

    /**
     * Generator that kick starts the login process
     * @param action 
     */
    public *startLoginSaga(action: any): IterableIterator<any> {
        if (action.username.trim().length === 0 || action.password.trim().length === 0 ) {     
            if (action.username.trim().length === 0 ) {
                yield put (invalidUsername());              
            }
    
            if (action.password.trim().length === 0 ) {
                yield put (invalidPassword());
            }
            return;
        }
        yield put({ type: constants.LOGIN_REQUEST_PENDING});
        try {
            const response = yield call([this.authService, this.authService.login], action.username, action.password);
            const loginResult = response.data;
            if (loginResult.mfaDetails) {
                yield apply (this.loginSpinner, this.loginSpinner.dispose);
                yield put({type: constants.LOGIN_REQUEST_NEED_MFA, loginResult});                
            } else {
                yield put({type: constants.LOGIN_REQUEST_FULFILLED, loginResult});
                yield put({type: constants.LOGIN_REQUEST_COMPLETED});
            }
        } catch(error) {
            yield apply (this.loginSpinner, this.loginSpinner.dispose);
            yield put({type: constants.LOGIN_REQUEST_REJECTED, error});
        }
    }
}