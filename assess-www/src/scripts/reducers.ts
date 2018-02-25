// here is where we compose and collect all reducers for the app
import loginReducers from './login/reducers';

import { STARTUP_ACTIONS } from './app-constants';

const initialState = {   
    started: false,
    targetPage: ''   
};

const startup = (state: any = initialState, action: any) => {
    let newState: any;
    switch(action.type) {
        case STARTUP_ACTIONS.BOOTSTRAP:        
            newState = {...state, started: true};
            break;
        case STARTUP_ACTIONS.SHOW_LOGIN:
            newState = {...state, targetPage: STARTUP_ACTIONS.SHOW_LOGIN};
            break;            
        default:
            newState = state;
            break;
    }
    return newState;
}

const appReducers = {
    ...loginReducers, startup
};

export default appReducers;