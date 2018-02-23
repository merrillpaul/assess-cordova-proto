import { Service, Inject } from 'typedi';
import { LoginState, LoginUserInfo } from '@assess/login/dto/login-state';
import { AppContext } from '@assess/app-context';

@Service()
export class LoginStateProvider {

    @Inject()
    private appContext:AppContext;

    public getState(): LoginState {
        return this.appContext.getState().login as LoginState;
    }

    public getUserInfo() : LoginUserInfo {
        return this.getState().userInfo;
    }
}