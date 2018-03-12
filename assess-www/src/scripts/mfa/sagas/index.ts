import loginConstants  from '@assess/login/constants';
import { MfaSaga } from '@assess/mfa/sagas/saga';
import { Logger } from '@assess/shared/log/logger-annotation';
import {  LoggingService } from '@assess/shared/log/logging-service';
import constants from '../constants';

import { all, put, takeLatest } from 'redux-saga/effects';
import { Container, Inject, Service } from 'typedi';

@Service()
class MfaSagaWatcher {

    @Inject()
    private mfaSaga: MfaSaga;

    @Logger()
    private logger: LoggingService;

    public *watchForMfaTrigger(): IterableIterator<any> {
        yield takeLatest(loginConstants.LOGIN_REQUEST_NEED_MFA, this.mfaSaga.startMfaSaga.bind(this.mfaSaga)); 
    }

    public *watchForOtpRequest() {
        yield takeLatest(constants.REQUEST_OTP, this.mfaSaga.requestOtp.bind(this.mfaSaga));  
    }

    public *watchForMfaRequest() {
        yield takeLatest(constants.REQUEST_MFA, this.mfaSaga.login.bind(this.mfaSaga));  
    }

    public *watchForMfaDone() {
        yield takeLatest(constants.MFA_REQUEST_FULFILLED, this.mfaDone.bind(this));
    }

    private *mfaDone(action: any) {
        this.logger.success("MFA Done !");
        yield put({type: loginConstants.LOGIN_REQUEST_COMPLETED});        
    }
}

export default function* mfaRootSaga() {
    const watcher: MfaSagaWatcher = Container.get(MfaSagaWatcher);
    yield all([
        watcher.watchForMfaTrigger.bind(watcher)(), 
        watcher.watchForOtpRequest.bind(watcher)(),
        watcher.watchForMfaRequest.bind(watcher)(),
        watcher.watchForMfaDone.bind(watcher)()
    ]);
} 