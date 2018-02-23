import { Container, Inject, Service } from "typedi";

import {
	applyMiddleware,
	combineReducers,
	compose,
	createStore,
	Store
} from "redux";

import logger from "redux-logger";
import reducers from "./reducers";

import thunk from "redux-thunk";

import promiseMiddleware from "redux-promise-middleware";

import { AppContext } from './app-context';
import { LoginForm } from './login/login-form';

@Service()
export class Bootstrapper {

    private appArea: HTMLElement;

    @Inject()
    private loginForm: LoginForm;

    constructor() {
        this.setupRedux();
        this.appArea = document.getElementById('app-area');
    }    

    public startup(): void {
       this.appArea.innerHTML = '';
       this.appArea.appendChild(this.loginForm.createComponent());
    }

	private setupRedux() {
		const composeEnhancers =
			process.env.NODE_ENV !== "production" &&
			typeof window === "object" &&
			window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
				? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
						// Specify extension’s options like here name, actionsBlacklist, actionsCreators or immutablejs support
					})
				: compose;

		const combinedReducers = combineReducers(reducers as any);
		const enhancer = composeEnhancers(applyMiddleware(thunk, promiseMiddleware(), logger));
		const store: Store<any> = createStore(combinedReducers, enhancer);
		Container.get(AppContext).setStore(store);
	}
}
