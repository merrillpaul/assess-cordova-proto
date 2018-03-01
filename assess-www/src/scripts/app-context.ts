import { Service } from 'typedi';

import { Store } from 'redux';

@Service()
export class AppContext {
    
    private store:Store<any> | null;

    private inCordova: boolean;

    public setStore(store: Store<any>) {
        this.store = store;
        return this;
    }

    public getStore(): Store<any> {
        return this.store;
    }
    
    public getState(): any | null {
        return this.store ? this.store.getState(): null;
    }

    public dispatchAction(action): void {
        this.store.dispatch(action);
    }

    public setInCordova(): void {
        this.inCordova = true;
    }

    public get withinCordova(): boolean {
        return this.inCordova;
    }
}
