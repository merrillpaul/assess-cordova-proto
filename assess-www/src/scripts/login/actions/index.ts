import constants from '@assess/login/constants';

/*
    action creators
*/

///  Sync Actions

/**
 * Informs that we have started the login process
 */
export function startLogin(): any {
    return {
        type: constants.LOGIN_REQUEST
    };
}

export function requestAuthFail(errors: string[]) {
    return {
        type: constants.LOGIN_FAILURE,
        errors: errors
    };
}


/*
    async actions with thunks
*/
export function invokeLogin(username: string, password: string): Function {
    
    return dispatch => {
        dispatch(startLogin());       

        setTimeout(() => dispatch(requestAuthFail(['No queso', 'No Mayo too'])), 5000);

    };
};

