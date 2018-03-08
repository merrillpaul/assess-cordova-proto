import loginConstants  from '@assess/login/constants';
import { MfaSaga } from '@assess/mfa/sagas/saga';
import constants from '../constants';

import { all, takeLatest } from 'redux-saga/effects';
import { Container, Inject, Service } from 'typedi';

@Service()
class MfaSagaWatcher {

    @Inject()
    private mfaSaga: MfaSaga;

    public *watchForMfaTrigger(): IterableIterator<any> {
        yield takeLatest(loginConstants.LOGIN_REQUEST_NEED_MFA, this.mfaSaga.startMfaSaga.bind(this.mfaSaga)); 
    }

    public *watchForOtpRequest() {
        yield takeLatest(constants.REQUEST_OTP, this.mfaSaga.requestOtp.bind(this.mfaSaga));  
    }
}

export default function* mfaRootSaga() {
    const watcher: MfaSagaWatcher = Container.get(MfaSagaWatcher);
    yield all([
        watcher.watchForMfaTrigger.bind(watcher)(), 
        watcher.watchForOtpRequest.bind(watcher)()
    ]);
} 