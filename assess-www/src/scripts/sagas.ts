import { all, put, takeEvery } from "redux-saga/effects";
import { STARTUP_ACTIONS } from "./app-constants";
import contentRootSaga from "./content/sagas";
import loginRootSaga from "./login/sagas";


function* kickStart(action: any): IterableIterator<any> {
	// TODO actions to decide which way to go
	yield put({ type: STARTUP_ACTIONS.SHOW_LOGIN });
}

function* watchBootstrap() {
	yield takeEvery(STARTUP_ACTIONS.BOOTSTRAP, kickStart);
}

// compose all sagas in the app
export function* rootSaga() {
	yield all([
		// enlist all sagas
		watchBootstrap(),
		loginRootSaga(),
		contentRootSaga()
	]);
}
