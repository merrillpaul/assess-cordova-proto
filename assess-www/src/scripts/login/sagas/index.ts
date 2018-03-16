
import constants from '@assess/login/constants';
import { LoginSaga } from '@assess/login/sagas/saga';

import { all, takeLatest } from 'redux-saga/effects';
import { Container } from 'typedi';

function* watchStartLogin() {
    const loginSaga = Container.get(LoginSaga);
    yield takeLatest(constants.START_LOGIN, loginSaga.startLoginSaga.bind(loginSaga));   
}

function* watchSuccessFullLogin() {
    const loginSaga = Container.get(LoginSaga);
    yield takeLatest(constants.MARK_USER_LOGIN, loginSaga.markLogin.bind(loginSaga));       
}

function* helloLoginWorld() {
    // console.log('Hello Login Sagas!')
}

export default function* loginRootSaga() {
    yield all([helloLoginWorld(), watchStartLogin(), watchSuccessFullLogin()]);
} 