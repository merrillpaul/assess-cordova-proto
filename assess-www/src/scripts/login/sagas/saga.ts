import { invalidPassword, invalidUsername } from '@assess/login/actions';
import constants from '@assess/login/constants';
import { LoginStateProvider } from '@assess/login/reducers/state-provider';
import { LoginSpinnerOverlay } from '@assess/login/spinner/login-spinner';
import { ILoginUserInfo } from '@assess/shared/dto/login-state';
import { AuthService } from '@assess/shared/security/auth-service';
import { UserStoreService } from '@assess/shared/security/user-store-service';

import { apply, call, put } from 'redux-saga/effects';
import { Container, Inject, Service } from 'typedi';

@Service()
export class LoginSaga {

    @Inject()
    private authService: AuthService;

    @Inject()
    private loginSpinner: LoginSpinnerOverlay;

    @Inject()
    private provider: LoginStateProvider;

    @Inject()
    private userStoreService: UserStoreService;

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
            
            const hashedPassword = this.authService.encrypt(action.password);  
            if (loginResult.mfaDetails) {
                yield apply (this.loginSpinner, this.loginSpinner.dispose);
                yield put({type: constants.LOGIN_REQUEST_NEED_MFA, loginResult});                
            } else {
                yield put({type: constants.LOGIN_REQUEST_FULFILLED, loginResult});
                yield put({type: constants.LOGIN_REQUEST_COMPLETED});
            }
            yield put({hashedPassword , type: constants.MARK_USER_LOGIN, username: action.username});
        } catch(error) {
            yield apply (this.loginSpinner, this.loginSpinner.dispose);
            yield put({type: constants.LOGIN_REQUEST_REJECTED, error});
        }
    }

    public *markLogin(action: any): IterableIterator<any> {
        const userInfo: ILoginUserInfo = this.provider.getUserInfo();
        const hashedPassword = action.hashedPassword;
        const username: string = action.username;
        this.userStoreService.markLoggedinUser(userInfo, username, hashedPassword);
    }

}