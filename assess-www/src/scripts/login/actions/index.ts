import constants from '../constants';

/*
    action creators
*/
export function startLogin(username: string, password: string) {
    return {
        type: constants.START_LOGIN,
        username,
        password
    };
};

export function invokeLogin() {
    return {
        type: constants.LOGIN_REQUEST
    };
}