import { AppContext } from '@assess/app-context';
import { BatteryStatusDAO, IImage } from '@assess/shared/battery/battery-status-dao';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { IEmpty, taskQManager } from '@assess/shared/queue/taskq';
import { IBatteryUpload, IImageSyncState, IImageUpload, ImageSyncStateEnum, ISyncState  } from '@assess/shared/sync/battery-upload';
import { BatteryUploadService } from '@assess/shared/sync/battery-upload-service';
import * as dateformat from 'dateformat';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Inject, Service } from 'typedi';


const TASK_NAME = 'syncOperation';
const IMAGE_TASK_NAME = 'imageSyncOperation';
const DATE_FORMAT = 'ddd, dd mmm yyyy HH:MM:ss Z';

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
    private imageErrors: any[] = [];

    constructor() {
        taskQManager.defineTask(TASK_NAME, (task) => this.batteryUploadService.runSyncOperation(task));
        taskQManager.defineTask(IMAGE_TASK_NAME, (task) => this.batteryUploadService.runImageSyncOperation(task));
        
        taskQManager.onEmpty.subscribe(val => {
            if (val.taskName === TASK_NAME && val.status === true) {
                this.queEmpty.next({errors: this.errors});
                this.batteryStatusDAO.setLastSync(dateformat(Date.now(), DATE_FORMAT));
                if (this.errors.length === 0 ) {
                    this.batteryStatusDAO.setLastSyncSuccess(dateformat(Date.now(), DATE_FORMAT));                    
                }
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

    public getLastSuccessfulSyncDate(): Promise<string> {
        return this.batteryStatusDAO.getLastSyncSuccess();
    }
    
    public performManualSync(): Observable<ISyncState> {
        this.logger.debug('performing manual sync');
        const manualStatus = new Subject<ISyncState>();
        this.batteryStatusDAO.getRepoIds()
        .then(repoIds => {
            // running these serially instead of parallel execution with Promise.all
            this.logger.debug(`Got repoids ${JSON.stringify(repoIds)}`);
            if (repoIds.length > 0 ) {                
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

    /**
     * Transferring a single battery before removing. Typically called when removed from ipad
     * @param batteryId 
     */
    public transferBatteryToShareAndRemove(batteryId: string): Observable<ISyncState> {
        this.logger.debug(`transfering battery to central and remove for ${batteryId}`);
        const transferStatus: BehaviorSubject<ISyncState> = new BehaviorSubject<ISyncState>({ errors: []});
       /* this.syncQueEmpty.subscribe((syncState: ISyncState) => {
            syncState.isWaitingForManualComplete = true;
            syncState.isRemove = true;
            this.logger.success('Del ques done');
            syncState.needsImages = false;
            transferStatus.next(syncState);
        });*/

        const queEmpty = taskQManager.onEmpty.subscribe(val => {
            if (val.taskName === TASK_NAME && val.status === true) {
                // if there were any image upload errors
                const syncState: ISyncState = transferStatus.value;
                syncState.isWaitingForManualComplete = true;
                syncState.isRemove = true;
                syncState.needsImages = false;
                if (this.errors.length > 0 ) {
                    this.logger.error('There have been errors in battery uploading');   
                    syncState.errors = this.errors;                    
                } else {
                    this.logger.success('Synq Que done');
                    syncState.errors = [];
                                     
                }
                queEmpty.unsubscribe();
                transferStatus.next(syncState);  
                this.errors = [];
            }
        });
        taskQManager.onFailed.subscribe(val => {
            if (val.taskName === TASK_NAME) {
                this.errors.push({data: val.data, error: val.error});
            }
        });
       

        const uploadBatteryOp = () => {
            return this.batteryStatusDAO.addBatteryIdToPending(batteryId)
            .then(() => this.batteryUploadService.opToSyncBatteryInForeground(batteryId, true))
            .then((bat) => this.uploadBattery(bat))
            .then(() => true);
        };

        this.batteryStatusDAO.isBatteryInRepo(batteryId)
        .then(found => {
            if (found) {
                this.batteryStatusDAO.getPendingImages().then(images => images.filter(it => it.batteryId === batteryId))
                .then(batteryImages => {
                    if (batteryImages.length > 0) {
                        const promises = batteryImages.map(i => {
                            return this.batteryUploadService.opToUploadImage(i)
                        });
                        const imageEmpty = taskQManager.onEmpty.subscribe(val => {
                            if (val.taskName === IMAGE_TASK_NAME && val.status === true) {
                                // if there were any image upload errors
                                if (this.imageErrors.length > 0 ) {
                                    this.logger.error('There have been errors in image uploading');
                                    const imageState: ISyncState = transferStatus.value;
                                    imageState.errors = this.imageErrors;
                                    imageState.imageSyncState.status = ImageSyncStateEnum.ERROR;
                                    transferStatus.next(imageState);
                                } else {
                                    const imageState: ISyncState = transferStatus.value;
                                    imageState.errors = [];
                                    imageState.imageSyncState.status = ImageSyncStateEnum.COMPLETE;
                                    transferStatus.next(imageState);
                                    uploadBatteryOp();
                                }
                                imageEmpty.unsubscribe();
                                this.imageErrors = [];
                            }
                        });
                        taskQManager.onFailed.subscribe(val => {
                            if (val.taskName === IMAGE_TASK_NAME) {
                                this.imageErrors.push({data: val.data, error: val.error});
                            }
                        });
                     
                        return Promise.all(promises)
                        .then(imageUploads => imageUploads.filter(i => i !== null))
                        .then(imageUploads => { 
                            if (imageUploads.length > 0) {
                                const imageState: ISyncState = {
                                    errors: [],                                     
                                    imageSyncState: { 
                                        numImagesRemaining: imageUploads.length,
                                        status: ImageSyncStateEnum.STARTED   ,
                                        totalNumImagesToUpload: imageUploads.length                                                                        
                                    },
                                    needsImages: true, 
                                };

                                transferStatus.next(imageState);
                                imageUploads.map(i => this.uploadImage(i, transferStatus));
                            }
                            
                            return true;
                        })
                        .then(() => true);
                    } else {
                        // start the battery upload
                        uploadBatteryOp()
                        return true;
                    }
                })
            } else {
                transferStatus.next({errors: [], isWaitingForManualComplete: true, noneToSync: true});
                return true;
            }
        });

        return transferStatus;
    }

    /**
     * Uploads all images from the repo
     */
    public async uploadAllAssessmentImages(transferStatus: BehaviorSubject<ISyncState>): Promise<boolean> {
        this.logger.debug(`uploadAllAssessmentImages battery to central`);
        const pendingImages: IImage[] = await this.batteryStatusDAO.getPendingImages();
        const imageState: ISyncState = {
            errors: [],
            imageSyncState: { 
                numImagesRemaining: pendingImages.length,
                status: ImageSyncStateEnum.STARTED,
                totalNumImagesToUpload: pendingImages.length                         
            }, 
            needsImages: true,            
        };
        if (pendingImages.length > 0) {
            let imageUploads: IImageUpload[] = [];
            for (let t = 0, len = pendingImages.length; t < len; t++) {
                imageUploads.push(await this.batteryUploadService.opToUploadImage(pendingImages[t]));
            }
            imageUploads = imageUploads.filter(it => it !== null);
            imageState.imageSyncState.totalNumImagesToUpload = imageUploads.length;
            imageState.imageSyncState.numImagesRemaining = imageUploads.length;
            transferStatus.next(imageState);            

            const imageEmpty = taskQManager.onEmpty.subscribe(val => {
                if (val.taskName === IMAGE_TASK_NAME && val.status === true) {
                    // if there were any image upload errors
                    if (this.imageErrors.length > 0 ) {
                        this.logger.error('There have been errors in image uploading');
                        imageState.errors = this.imageErrors;
                        imageState.imageSyncState.status = ImageSyncStateEnum.ERROR;
                    } else {
                        imageState.imageSyncState.status = ImageSyncStateEnum.COMPLETE;
                    }
                    transferStatus.next(imageState);
                    imageEmpty.unsubscribe();
                    this.imageErrors = [];
                }
            });
            taskQManager.onFailed.subscribe(val => {
                if (val.taskName === IMAGE_TASK_NAME) {
                    this.imageErrors.push({data: val.data, error: val.error});
                }
            });
            imageUploads.map(i => this.uploadImage(i, transferStatus));
            return true;
            
        } else {
           // imageState.imageSyncState.status = ImageSyncStateEnum.COMPLETE;
            transferStatus.next(imageState);
        }

        return true;
        
    }
    
    
    public cancelPendingSyncs(): void {
        this.logger.info('Cancelling pending syncs');
        try {
        const pendingOnes = taskQManager.cancelPending(TASK_NAME);
        pendingOnes.forEach((it: any) => {
            const battery: IBatteryUpload = it.battery;
            if (battery.cancelToken) {
                battery.cancelToken.cancel(`Cancelling sync for battery ${it.batteryId}`);
            }
        });
        } catch(e) {
            this.logger.warn('Ignore any error while cancelling');
        }
    }

    public cancelPendingImageSyncs(): void {
        this.logger.info('Cancelling pending image syncs');
        try {
        const pendingOnes = taskQManager.cancelPending(IMAGE_TASK_NAME);
        pendingOnes.forEach((it: any) => {
            const image: IImageUpload = it.image;
            if (image.uploadTracker) {
                image.uploadTracker.abort();
                this.logger.warn(`Cancelling sync for battery ${it.batteryId}`);
            }
        });
        } catch(e) {
            this.logger.warn('Ignore any error while cancelling');
        }
    }

    private uploadBattery(battery: IBatteryUpload): boolean {
        this.logger.debug(`adding battery upload to q for ${battery.batteryId}`);
        taskQManager.addToTask(TASK_NAME, { battery });   
        return true;     
    }

    private uploadImage(image: IImageUpload, imageSyncState: BehaviorSubject<ISyncState>): boolean {
        this.logger.debug(`adding image upload to q for ${image.batteryId} ${image.imageId}`);
        taskQManager.addToTask(IMAGE_TASK_NAME, { image, imageSyncState });   
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