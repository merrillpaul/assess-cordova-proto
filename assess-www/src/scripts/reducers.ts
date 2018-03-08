// here is where we compose and collect all reducers for the app
import contentReducers from "./content/reducers";
import loginReducers from "./login/reducers";

import { STARTUP_ACTIONS } from "./app-constants";

const initialState = {
	started: false,
	targetPage: ""
};

const startup = (state: any = initialState, action: any) => {
	let newState: any;
	switch (action.type) {
		case STARTUP_ACTIONS.BOOTSTRAP:
			newState = { ...state, started: true, targetPage: STARTUP_ACTIONS.BOOTSTRAP };
			break;
		case STARTUP_ACTIONS.SHOW_LOGIN:
			newState = { ...state, targetPage: STARTUP_ACTIONS.SHOW_LOGIN };
			break;
		case STARTUP_ACTIONS.SHOW_MFA:
			newState = { ...state, targetPage: STARTUP_ACTIONS.SHOW_MFA };
			break;
		default:
			newState = state;
			break;
	}
	return newState;
};

const appReducers = {
	...loginReducers,
	...contentReducers,
	startup
};

export default appReducers;
