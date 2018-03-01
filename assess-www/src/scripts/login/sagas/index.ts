
import constants from '@assess/login/constants';
import { loginSaga } from '@assess/login/sagas/saga';

import { all, takeLatest } from 'redux-saga/effects';

function* watchStartLogin() {
    yield takeLatest(constants.START_LOGIN, loginSaga.startLoginSaga.bind(loginSaga));   
}

function* helloLoginWorld() {
    // console.log('Hello Login Sagas!')
}

export default function* loginRootSaga() {
    yield all([helloLoginWorld(), watchStartLogin()]);
} 