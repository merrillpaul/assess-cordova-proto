import constants from '@assess/login/constants';
import { LoginState } from '@assess/login/dto/login-state';

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
   isLoggingIn: false,
   startedRequest: false,
   loggedIn: false,
   userInfo: {},
   errors: []
};

const login = (state: any = initialState, action: any): LoginState => {
    let newState: any;
    switch(action.type) {
        case constants.LOGIN_REQUEST:
            newState = {...state, startedRequest: true, isLoggingIn: true}
            break;
        case constants.LOGIN_FAILURE:
            newState = {...state, errors: action.errors, isLoggingIn: false}
            break;    
        default:
            newState = state;
            break;
    }
    return newState;
}

export default login;