import constants from '../constants';
import { LoginState } from '../dto/login-state';

/*
 * state shape
  {
    isLoggingIn: true/false ( for spinners),
    loggedIn: true/false
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
   loggedIn: false,
   userInfo: {},
   errors: []
};

const login = (state: any = initialState, action: any): LoginState => {
    let newState: any;
    switch(action.type) {
        case constants.START_LOGIN:
            newState = {...state, isLoggingIn: true};
            break;
        default:
            newState = state;
            break;
    }
    return newState;
}

export default login;