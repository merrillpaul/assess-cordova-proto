
import loginConstants from '@assess/login/constants';
import constants from '../constants';
import { contentDownloadSaga } from './content-download-saga';


import { all, takeEvery } from 'redux-saga/effects';

function* startSaga() {
    // we listen for successful logins
    yield takeEvery(loginConstants.LOGIN_REQUEST_FULFILLED, contentDownloadSaga.startSaga.bind(contentDownloadSaga));   
}

function* startQueryVersionSaga() {
    // we start the query versions once we get the versions
    yield takeEvery(constants.GET_HASHES_FULFILLED, contentDownloadSaga.startQueryVersionSaga.bind(contentDownloadSaga));   
}

function* startContentTarDownloadSaga() {
    // we start the query versions once we get the versions
    yield takeEvery(constants.QUERY_VERSION_FULFILLED, contentDownloadSaga.startContentTarDownloadSaga.bind(contentDownloadSaga));   
}


export default function* contentRootSaga() {
    yield all([startSaga(), startQueryVersionSaga(), startContentTarDownloadSaga()]);
} 