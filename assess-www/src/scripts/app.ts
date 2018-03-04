import "reflect-metadata";

import "../styles/base.scss";

import config from "@appEnvironment";
import { AppContext } from '@assess/app-context';

import { Container } from "typedi";
import { Bootstrapper } from "./bootstrap";

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


const setupRedux = () => {
	const composeEnhancers =
		process.env.NODE_ENV !== "production" &&
		typeof window === "object" &&
		window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
			? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
				maxAge: 300		
			})
			: compose;

	const combinedReducers = combineReducers(reducers as any);
	const sagaMiddleware = createSagaMiddleware();
	const enhancer = composeEnhancers(
		applyMiddleware(sagaMiddleware, promiseMiddleware(), logger)
	);
	const store: Store<any> = createStore(combinedReducers, enhancer);
	Container.get(AppContext).setStore(store);	
	sagaMiddleware.run(rootSaga);	
}


const bootup = (inCordova) => {
	setupRedux();
	Container.get(Bootstrapper).startup(inCordova);
};

if (window.cordova) {
	document.addEventListener("deviceready", () => bootup(true) , false);
} else {
	document.addEventListener("DOMContentLoaded", () => bootup(false));
}
