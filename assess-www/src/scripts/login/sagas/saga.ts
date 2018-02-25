import { invalidPassword, invalidUsername } from '@assess/login/actions';
import constants from '@assess/login/constants';
import { AuthService } from '@assess/services/auth-service';
import { Container, Inject, Service } from 'typedi';

import { call, put } from 'redux-saga/effects';

@Service()
class LoginSaga {

    @Inject()
    private authService: AuthService;

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
        /*yield put({ type: constants.LOGIN_REQUEST_PENDING});
        try {
            const response = yield call([authService, authService.login], action.username, action.password);
            const loginResult = response.data.results[0];
            yield put({type: constants.LOGIN_REQUEST_FULFILLED, loginResult});
        } catch(error) {
            yield put({type: constants.LOGIN_REQUEST_REJECTED, error});
        }*/
        
        // this uses redux-promise-middleware to auto create action types
        yield put.resolve({type: constants.LOGIN_REQUEST, payload: this.authService.login(action.username, action.password)});
        yield put({type: constants.LOGIN_REQUEST_COMPLETED});
    }
}

export const loginSaga = Container.get(LoginSaga);