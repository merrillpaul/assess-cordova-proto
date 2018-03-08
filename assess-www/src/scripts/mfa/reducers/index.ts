import { IMfaState } from "@assess/mfa/dto";
import constants from '../constants';

const initialState: IMfaState = {
    errors: [],
    loggingIn: false,
    mfaSuccess: false,
    triggerOtpMessage: '',
    triggerOtpSuccess: false,
    triggeringOtp: false
};


const mfa = (state: IMfaState = initialState, action: any): IMfaState => {
    let newState: IMfaState;
    switch(action.type) {  

        case constants.REQUEST_OTP:
            newState = {...initialState, currentMfaType: action.mfaType};
            break;
        case constants.TRIGGER_OTP_PENDING:
            newState = {...state, triggeringOtp: true};
            break;
        case constants.TRIGGER_OTP_FULFILLED:
            const payload = action.payload;
            newState = {...state, triggeringOtp: false, triggerOtpMessage: payload.message, triggerOtpSuccess: payload.success};
            break;
        case constants.TRIGGER_OTP_REJECTED:
            newState = {...state, triggeringOtp: false, triggerOtpSuccess: false};
            break;
        case constants.MFA_REQUEST_PENDING:
            newState = {...state, loggingIn: true};
            break;
        case constants.MFA_REQUEST_FULFILLED:
        case constants.MFA_REQUEST_REJECTED:
            newState = {...state, loggingIn: false, errors: action.errors};
            break;
        default:
            newState = state;
            break;
    }
    return newState;
};

export default { mfa };