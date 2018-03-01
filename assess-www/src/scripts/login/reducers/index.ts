import constants from '@assess/login/constants';
import { LoginFormState, LoginState } from '@assess/shared/dto/login-state';

/*
 * state shape
  {
    isLoggingIn: true/false ( for spinners),
    loggedIn: true/false
    startedRequest: true/false
    userInfo: {
       userName: 'asa',
       userId: '1000',
       eligibleSubtestGUIDs: [
           'guid1
       ],
       timeZoneOffset: 'offset',
       timeZoneLabel: 'label',
       mfaDetails: {
          "mfaVerified": true,
            "codeEntryFldName": "j_mfa_code",
            "mfaTypes": [
                {
                "communicatorAddress": "",
                "expirationTimeInMillis": 0,
                "mfaTypeKey": "mfa.type.google.authenticator",
                "orderOfPreference": 1
                },
                {
                "communicatorAddress": "+x-xxx-xxx-7777",
                "expirationTimeInMillis": 0,
                "mfaTypeKey": "mfa.type.sms",
                "orderOfPreference": 2
                },
                {
                "communicatorAddress": "txxxxxxxxx@psn.com",
                "expirationTimeInMillis": 0,
                "mfaTypeKey": "mfa.type.email",
                "orderOfPreference": 3
                }
            ],
            "postUrl": "j_spring_mfa_check",
            "rememberMeFldName": "j_mfa_remember_me",
            "typeFldName": "j_mfa_type",
            "reAuthTimeout": 120000
       }
   }
  }
 */

const initialState = {   
    errors: [],
    loggedIn: false,
    userInfo: {}   
};

const login = (state: any = initialState, action: any): LoginState => {
    let newState: any;
    switch(action.type) {
        case constants.LOGIN_REQUEST_PENDING:        
            newState = {...state, errors: [], loggedIn: false, userInfo: {}};
            break;
        case constants.LOGIN_REQUEST_REJECTED:
            newState = {...state, errors: [action.error]};
            break;
        case constants.LOGIN_REQUEST_FULFILLED:
            newState = {...state, errors: [], loggedIn: true, userInfo: action.loginResult};
            break;     
        default:
            newState = state;
            break;
    }
    return newState;
}

const loginForm = (state: LoginFormState = {
    fetching: false,
    passwordInError: false,
    usernameInError: false    
}, action: any): LoginFormState => {
    let newState: LoginFormState;
    switch(action.type) {
        case constants.LOGIN_REQUEST_PENDING:
        case constants.START_LOGIN:
            newState = {...state, fetching: true, usernameInError: false, passwordInError: false};
            break;
        case constants.USERNAME_ERROR:
            newState = {...state, fetching: false, usernameInError: true};
            break;
        case constants.PASSWORD_ERROR:
            newState = {...state, fetching: false, passwordInError: true};
            break;
        case constants.LOGIN_REQUEST_FULFILLED:                   
        case constants.LOGIN_REQUEST_REJECTED:
            newState = {...state, fetching: false };    
            break; 
        default:
            newState = state;
            break;
    }
    return newState;
}

export default {
    login, loginForm
};