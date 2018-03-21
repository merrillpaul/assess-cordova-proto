import { AppContext } from '@assess/app-context';
import { BatteryStatusDAO } from '@assess/shared/battery/battery-status-dao';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { IEmpty, taskQManager } from '@assess/shared/queue/taskq';
import { IBatteryUpload, ISyncState } from '@assess/shared/sync/battery-upload';
import { BatteryUploadService } from '@assess/shared/sync/battery-upload-service';
import { Observable, Subject } from "rxjs";
import { Inject, Service } from 'typedi';


const TASK_NAME = 'syncOperation';

@Service()
export class SyncOperationQ {

    @Inject()
    private batteryStatusDAO: BatteryStatusDAO;

    @Inject()
    private batteryUploadService: BatteryUploadService;

    @Inject()
    private appContext: AppContext;

    @Logger()
    private logger: LoggingService;

    private queEmpty: Subject<ISyncState> = new Subject<ISyncState>();
    private errors: any[] = [];

    constructor() {
        taskQManager.defineTask(TASK_NAME, (task) => this.batteryUploadService.runSyncOperation(task));
        taskQManager.onEmpty.subscribe(val => {
            if (val.taskName === TASK_NAME && val.status === true) {
                this.queEmpty.next({errors: this.errors});
                this.errors = [];
            }
        });
        taskQManager.onFailed.subscribe(val => {
            if (val.taskName === TASK_NAME) {
                this.errors.push({data: val.data, error: val.error});
            }
        });
    }

    public get syncQueEmpty() : Observable<ISyncState> {
        return this.queEmpty.asObservable();
    }
    
    public performManualSync(): Observable<ISyncState> {
        this.logger.debug('performing manual sync');
        const manualStatus = new Subject<ISyncState>();
        this.batteryStatusDAO.getRepoIds()
        .then(repoIds => {
            // running these serially instead of parallel execution with Promise.all
            this.logger.debug(`Got repoids ${JSON.stringify(repoIds)}`);
            if (repoIds.length > 0 ) {
                /*
                return repoIds.reduce((promise, id) => {
                    return promise.then(() => this.updateFileForBatteryOperation(id))
                    .then(val => {
                        if (!val) {
                            this.logger.debug('adding battery id');
                            return this.batteryStatusDAO.addBatteryIdToPending(id)
                            .then(() => this.batteryUploadService.opToSyncBattery(id, false))
                            .then(battery => this.uploadBattery(battery))
                        } else {
                            return Promise.resolve();
                        }
                    });
                }, Promise.resolve());*/
                const promises = [];
                repoIds.forEach(id => {
                    const p = this.updateFileForBatteryOperation(id)
                    .then(val => {
                        if (!val) {
                            this.logger.debug('adding battery id');
                            return this.batteryStatusDAO.addBatteryIdToPending(id)
                            .then(() => this.batteryUploadService.opToSyncBattery(id, false));                            
                        } else {
                            return Promise.resolve(null);
                        }
                    }).catch(e => {
                        this.logger.error(`An error occured for ${id} with ${JSON.stringify(e)}`);
                        return null;
                    });
                    promises.push(p);
                });
                return Promise.all(promises)
                .then(batteries => batteries.filter(it => it !== null))
                .then(batteries => batteries.map(bat => this.uploadBattery(bat)))
                .then(() => true);
                
            } else {
                manualStatus.next({
                    errors: [],
                    isRemove: false,
                    isWaitingForManualComplete: true,
                    noneToSync: true                   
                });
                return true;
            }
        })
        .then(() => Promise.resolve());
        
        this.syncQueEmpty.subscribe((syncState: ISyncState) => {
            syncState.isWaitingForManualComplete = true;
            this.logger.success('All sync manual ques done');
            manualStatus.next(syncState);
        });
        return manualStatus;
        // TODO
        // syncPerformanceLogs;
	    // syncErrorLogs;
    }  

    private uploadBattery(battery: IBatteryUpload): boolean {
        this.logger.debug(`adding battery upload to q for ${battery.batteryId}`);
        taskQManager.addToTask(TASK_NAME, { battery });   
        return true;     
    }

    private updateFileForBatteryOperation(batteryId: string): Promise<boolean> {
        if(!this.appContext.withinCordova) {
            return Promise.resolve(true);
        }
        return this.batteryStatusDAO.isBatteryIdPending(batteryId)
        .then(status => {
            this.logger.debug(`battery ${batteryId} is in pending state ? ${status}`);
            if (status) {
                const pendingBattery: IBatteryUpload = taskQManager.getPendingTaskData(TASK_NAME).filter((it: IBatteryUpload ) => it.batteryId === batteryId)[0];
                if (pendingBattery) {
                    this.logger.debug(`Got pending battery from the task que with ${pendingBattery.batteryId} and ${pendingBattery.savedBatteryFileName}`);
                    return this.batteryUploadService.updatePendingCopyIfPossible(pendingBattery);
                } 
                return false;
            } else {
                return false;
            }
        })
    }
}