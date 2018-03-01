import { Container, Inject, Service } from "typedi";

import {
	applyMiddleware,
	combineReducers,
	compose,
	createStore,
	Dispatch,
	Store
} from "redux";
import { default as createSagaMiddleware, SagaIterator } from "redux-saga";

import logger from "redux-logger";
import reducers from "./reducers";
import { rootSaga } from "./sagas";

import promiseMiddleware from "redux-promise-middleware";

import { QueryVersionStatus } from '@assess/content/dto';
import { BootstrapStateProvider } from "@assess/shared/state/bootstrap-state-provider";
import { STARTUP_ACTIONS } from "./app-constants";
import { AppContext } from "./app-context";
import { LoginForm } from "./login/login-form";


@Service()
export class Bootstrapper {
	private appArea: HTMLElement;

	@Inject() private loginForm: LoginForm;

	@Inject() private stateProvider: BootstrapStateProvider;

	private dispatch: Dispatch<any>;

	constructor() {
		this.setupRedux();
		this.appArea = document.getElementById("app-area");
	}

	public startup(inCordova: boolean | null): void {
		this.appArea.innerHTML = "";
		if ( inCordova ) {
			Container.get(AppContext).setInCordova();
		}
		this.initEvents();
		this.dispatch({ type: STARTUP_ACTIONS.BOOTSTRAP });
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
		const sagaMiddleware = createSagaMiddleware();
		const enhancer = composeEnhancers(
			applyMiddleware(sagaMiddleware, promiseMiddleware(), logger)
		);
		const store: Store<any> = createStore(combinedReducers, enhancer);
		sagaMiddleware.run(rootSaga);
		Container.get(AppContext).setStore(store);
		this.dispatch = store.dispatch;
	}

	private initEvents() {
		this.stateProvider.onTargetPage().subscribe(change => {
			switch (change.newVal) {
				case STARTUP_ACTIONS.BOOTSTRAP:
					this.appArea.innerHTML = "";
					break;
				case STARTUP_ACTIONS.SHOW_LOGIN:
					this.addComponent(this.loginForm.createContainer());
					break;
				default:
					break;
			}
		});
	}

	private addComponent(component: HTMLElement): void {
		this.appArea.innerHTML = "";
		this.appArea.appendChild(component);
	}
}
