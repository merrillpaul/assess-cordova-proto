
import loginConstants from '@assess/login/constants';
import constants from '../constants';
import { ContentDownloadSaga } from './content-download-saga';

import { all, takeLatest } from 'redux-saga/effects';
import { Container } from 'typedi';

function getDownloadSaga() {
    return Container.get(ContentDownloadSaga); 
}

function* startSaga() {
    // we listen for successful logins
    const contentDownloadSaga = getDownloadSaga();
    yield takeLatest(loginConstants.LOGIN_REQUEST_FULFILLED, contentDownloadSaga.startSaga.bind(contentDownloadSaga));   
}

function* startQueryVersionSaga() {
    // we start the query versions once we get the versions
    const contentDownloadSaga = getDownloadSaga();
    yield takeLatest(constants.GET_HASHES_FULFILLED, contentDownloadSaga.startQueryVersionSaga.bind(contentDownloadSaga));   
}

function* startPostQueryVersion() {
    // we start the query versions once we get the versions
    const contentDownloadSaga = getDownloadSaga();
    yield takeLatest(constants.QUERY_VERSION_COMPLETED, contentDownloadSaga.startPostQueryVersion.bind(contentDownloadSaga));   
}

function* startDownloadTars() {
     // we start the query versions once we get the versions
     const contentDownloadSaga = getDownloadSaga();
     yield takeLatest(constants.CONTENT_DOWNLOAD_TAR_SAGA_STARTED, contentDownloadSaga.startDownloadTars.bind(contentDownloadSaga));   
}

function* startTarExtraction() {
    const contentDownloadSaga = getDownloadSaga();
    yield takeLatest(constants.CONTENT_DOWNLOAD_TAR_SAGA_FINISHED, 
        contentDownloadSaga.startExtraction.bind(contentDownloadSaga));
}

/** This is our root content download Epic */
export default function* contentRootSaga() {
    yield all([
        startSaga(), 
        startQueryVersionSaga(), 
        startPostQueryVersion(), 
        startDownloadTars(),
        startTarExtraction()
    ]);
} 