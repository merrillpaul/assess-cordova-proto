import constants from '@assess/login/constants';

/*
    action creators
*/
export const invalidUsername = () => {
    return {
        type: constants.USERNAME_ERROR
    };
};

export const invalidPassword = () => {
    return {
        type: constants.PASSWORD_ERROR
    };
};

export const startLogin = (username: string, password: string) => {
    return {
        password,
        type: constants.START_LOGIN,
        username
    };
};


