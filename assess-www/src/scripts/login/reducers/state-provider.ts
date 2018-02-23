import { Service, Inject } from 'typedi';
import { LoginState, LoginUserInfo } from '../dto/login-state';
import { AppContext } from '../../app-context';

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