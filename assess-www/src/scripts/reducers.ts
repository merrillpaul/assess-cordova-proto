// here is where we compose and collect all reducers for the app
import loginReducers from './login/reducers';

const appReducers = {
    ...loginReducers
};

export default appReducers;