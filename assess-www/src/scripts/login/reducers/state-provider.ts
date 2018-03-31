import { AppContext } from '@assess/app-context';
import { BaseStateProvider, IStoreObservable } from '@assess/shared/state/base-state-provider';

import { ILoginFormState, ILoginState, ILoginUserInfo } from '@assess/shared/dto/login-state';
import { Observable } from 'rxjs';

import { Inject, Service } from 'typedi';

import { Watchables } from '@assess/shared/state/watchable';


@Service()
@Watchables([
    {
        properties: [
            'loggedIn',
            'errors',
            'userInfo'
        ],
        reducerName: "login"        
    },
    {
        properties: [
            'usernameInError',
            'passwordInError',
            'fetching'
        ],
        reducerName: 'loginForm'    
    },
    {
        properties: [
            'contentQueryStatus'
        ],
        reducerName: 'queryContent'
    }
])
export class LoginStateProvider extends BaseStateProvider {  
    
    public getState(): ILoginState {
        return this.appContext.getState().login as ILoginState;
    }

    public getFormState(): ILoginFormState {
        return this.appContext.getState().loginForm as ILoginFormState;
    }

    public getUserInfo() : ILoginUserInfo {
        return this.getState().userInfo;
    }

    public onLogin(attr: string): Observable<IStoreObservable> {
        return this.onChange('login', attr);
    }
    
    public onFetching(): Observable<IStoreObservable> {
        return this.onChange('loginForm', 'fetching');
    }

    public onLoginErrors(): Observable<IStoreObservable> {
        return this.onChange('login', 'errors');
    }
}