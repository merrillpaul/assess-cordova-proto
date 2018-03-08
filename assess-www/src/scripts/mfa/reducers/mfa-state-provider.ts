import { IMfaState } from '@assess/mfa/dto';
import { IMfaDetails, LoginState } from '@assess/shared/dto/login-state';
import { BaseStateProvider, IStoreObservable } from '@assess/shared/state/base-state-provider';
import { Watchables } from '@assess/shared/state/watchable';
import { Observable } from "rxjs";
import { Service } from 'typedi';

@Service()
@Watchables([
    {
        properties: ["loggingIn", "triggeringOtp", "mfaSuccess"],
		reducerName: "mfa"
    }
])
export class MfaStateProvider extends BaseStateProvider {

    public getMfaState(): IMfaState {
		return this.appContext.getState().mfa;
    }
    
    public onOtpRequest(): Observable<IStoreObservable> {
		return this.onChange("mfa", "triggeringOtp");
    }

    public onLoginRequest(): Observable<IStoreObservable> {
		return this.onChange("mfa", "loggingIn");
    }

    public onMfaSuccess(): Observable<IStoreObservable> {
		return this.onChange("mfa", "mfaSuccess");
    }
    
    public getCommunicatorAddress(mfaType: string): string {
        const loginState: LoginState = this.appContext.getState().login as LoginState;
        const mfaDetails: IMfaDetails = loginState.userInfo.mfaDetails;
        if (!mfaDetails) {
            return '';
        } 

        const mfaDetail =  mfaDetails.mfaTypes.filter(it => it.mfaTypeKey === mfaType)[0];
        return mfaDetail.communicatorAddress || '';
    }
}