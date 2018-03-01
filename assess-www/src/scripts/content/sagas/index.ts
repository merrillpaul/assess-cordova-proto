
import loginConstants from '@assess/login/constants';
import constants from '../constants';
import { ContentDownloadSaga } from './content-download-saga';

import { all, takeEvery } from 'redux-saga/effects';
import { Container } from 'typedi';

function getDownloadSaga() {
    return Container.get(ContentDownloadSaga); 
}

function* startSaga() {
    // we listen for successful logins
    const contentDownloadSaga = getDownloadSaga();
    yield takeEvery(loginConstants.LOGIN_REQUEST_FULFILLED, contentDownloadSaga.startSaga.bind(contentDownloadSaga));   
}

function* startQueryVersionSaga() {
    // we start the query versions once we get the versions
    const contentDownloadSaga = getDownloadSaga();
    yield takeEvery(constants.GET_HASHES_FULFILLED, contentDownloadSaga.startQueryVersionSaga.bind(contentDownloadSaga));   
}

function* startPostQueryVersion() {
    // we start the query versions once we get the versions
    const contentDownloadSaga = getDownloadSaga();
    yield takeEvery(constants.QUERY_VERSION_COMPLETED, contentDownloadSaga.startPostQueryVersion.bind(contentDownloadSaga));   
}


export default function* contentRootSaga() {
    yield all([startSaga(), startQueryVersionSaga(), startPostQueryVersion()]);
} 