import { AppContext } from '@assess/app-context';
import { BaseStateProvider, IStoreObservable } from '@assess/shared/state/base-state-provider';

import { LoginFormState, LoginState, LoginUserInfo } from '@assess/login/dto/login-state';
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
        reducerName: "loginForm"        
    }
])
export class LoginStateProvider extends BaseStateProvider {  
    
    public getState(): LoginState {
        return this.appContext.getState().login as LoginState;
    }

    public getFormState(): LoginFormState {
        return this.appContext.getState().loginForm as LoginFormState;
    }

    public getUserInfo() : LoginUserInfo {
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