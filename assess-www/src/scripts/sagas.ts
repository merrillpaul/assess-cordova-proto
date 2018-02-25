import { all } from 'redux-saga/effects';

import loginRootSaga from './login/sagas'


// compose all sagas in the app

export function* rootSaga() {
    yield all([loginRootSaga()]);
}