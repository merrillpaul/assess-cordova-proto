import { AppContext } from '@assess/app-context';
import { IWatchableItem, WATCHABLE_METADATA } from '@assess/shared/state/watchable';
import { Inject } from 'typedi';

import { Observable, Subject } from 'rxjs';

export interface IStoreObservable {
    newVal: any;
    oldVal: any;
    objectPath: string;
}

interface IMap<T> {
    [key: string]: T;
}

import watch =  require('redux-watch');

export abstract class BaseStateProvider {

    protected appContext:AppContext;
    private reducerObservables:IMap<IMap<Observable<IStoreObservable>>>;

    constructor(@Inject(type => AppContext) appContext: AppContext) {
        this.appContext = appContext;
        this.init();
    }

    /**
     * Provides an observable to  changes to portions of states partitioned by the reducer
     * @param reducerName 
     * @param property 
     */
    public onChange(reducerName: string, property: string): Observable<IStoreObservable> {
        const reducerObs = this.reducerObservables[reducerName];
        if (!reducerObs) {
            throw new Error(`No reducer with name ${reducerName} setup for store watches. 
            Look at providers that have @Watchable decorators to check the config`);
        }
        return reducerObs[property];
    }

    private init() {
        const store = this.appContext.getStore();
        const watchables = Reflect.getMetadata(WATCHABLE_METADATA, this.constructor);
        this.reducerObservables = {};
        watchables.forEach ((watchable: IWatchableItem)  => {
            const loginsObservables : IMap<Observable<IStoreObservable>> = {};
            watchable.properties.forEach(p => {
                const obs = new Subject<IStoreObservable>();
                const w = watch(store.getState, `${watchable.reducerName}.${p}`);
                store.subscribe(w((newVal, oldVal, objectPath) => {                    
                    obs.next({ newVal, oldVal, objectPath });
                }));
                loginsObservables[p] = obs;
            });
            this.reducerObservables[watchable.reducerName] = loginsObservables;
        });        
    }     
    
}