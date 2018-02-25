
import constants from '@assess/login/constants';
import { loginSaga } from '@assess/login/sagas/saga';

import { all, takeEvery } from 'redux-saga/effects';

function* watchStartLogin() {
    yield takeEvery(constants.START_LOGIN, loginSaga.startLoginSaga.bind(loginSaga));   
}

function* helloLoginWorld() {
    // console.log('Hello Login Sagas!')
}

export default function* loginRootSaga() {
    yield all([helloLoginWorld(), watchStartLogin()]);
} 