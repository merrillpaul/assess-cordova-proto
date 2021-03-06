import { ILoginState, ILoginUserInfo } from '@assess/shared/dto/login-state';
import { BaseStateProvider,	IStoreObservable } from "@assess/shared/state/base-state-provider";
import { Watchables } from "@assess/shared/state/watchable";

import { Observable } from "rxjs";
import { Service } from "typedi";


@Service()
@Watchables([
	{
		properties: ["targetPage"],
		reducerName: "startup"
	}
])
export class BootstrapStateProvider extends BaseStateProvider {
	public onTargetPage(): Observable<IStoreObservable> {
		return this.onChange("startup", "targetPage");
	}

	public getState(): ILoginState {
        return this.appContext.getState().login as ILoginState;
    }

    public getUserInfo() : ILoginUserInfo {
        return this.getState().userInfo;
    }  
}
