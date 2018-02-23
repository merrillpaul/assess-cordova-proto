import constants from '@assess/login/constants';
import { AuthService } from '@assess/services/auth-service';
import { Inject, Service } from 'typedi';


/*
    action creators
*/
const startLogin = () => {
    return {
        type: constants.START_LOGIN
    };
};

const invalidUsername = () => {
    return {
        type: constants.USERNAME_ERROR
    };
};

const invalidPassword = () => {
    return {
        type: constants.PASSWORD_ERROR
    };
};

const loginFail = (errors) => {
    return {
        errors,
        type: constants.LOGIN_REQUEST_REJECTED       
    };
};

@Service()
export class LoginActionsCreator {

    @Inject()
    private authService: AuthService;


    /**
     * Async action with promises
     * @param username login username
     * @param password login password
     */
    public invokeLogin(username: string, password: string) {        
        return dispatch => { 
            dispatch(startLogin());

            if (username.trim().length === 0 || password.trim().length === 0 ) {     
                if (username.trim().length === 0 ) {
                    dispatch(invalidUsername());                
                }
        
                if (password.trim().length === 0 ) {
                    dispatch(invalidPassword());
                }
                return;
            }

            dispatch({                
                payload: this.authService.login(username, password),
                type: constants.LOGIN_REQUEST
            });

            // setTimeout(() => dispatch(loginFail(['No Queso for you!'])), 4000);

        };
    }
};


