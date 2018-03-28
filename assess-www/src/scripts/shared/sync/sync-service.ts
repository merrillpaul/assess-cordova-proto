import { AppContext } from '@assess/app-context';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { ISyncState } from '@assess/shared/sync/battery-upload';
import { SyncOperationQ } from '@assess/shared/sync/sync-operation-q';
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { Inject, Service } from 'typedi';

@Service()
export class SyncService {

    @Inject()
    private syncQ: SyncOperationQ;

    @Inject()
    private appContext: AppContext;

    @Logger()
    private logger: LoggingService;

    public syncSubtestDataToShare(): Observable<ISyncState> {

        // TODO all those offline checks and auth checks
        this.logger.debug('Running syncSubtestDataToShare');
        return this.syncQ.performManualSync();        
    }

    public transferSingleBatteryDataToShareAndRemove(batteryId: string): Observable<ISyncState> {
        // TODO all those offline checks and auth checks
        this.logger.debug(`Transfering single battery data to central for ${batteryId}`);
        return this.syncQ.transferBatteryToShareAndRemove(batteryId);
    }

    public getLastSuccessfulSyncDate(): Promise<string> {
        if (!this.appContext.withinCordova) {
            return Promise.resolve('');
        }
        return this.syncQ.getLastSuccessfulSyncDate()
    }

    public queueBatteryForSync(batteryId: string) : Promise<boolean> {
        return Promise.resolve(true);
    }

    public queueUpdateIndicator(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public uploadAssessmentImagesToChooseShare(): Observable<ISyncState> {
        this.logger.debug(`Transfering uploading all images from the repo`);
        const transferStatus: BehaviorSubject<ISyncState> = new BehaviorSubject<ISyncState>({ errors: []});
        this.syncQ.uploadAllAssessmentImages(transferStatus);
        return transferStatus;
    }

    public cancelPendingSyncs(): void {
        this.syncQ.cancelPendingSyncs();
    }

    public cancelUploadAssessmentImages(): Promise<boolean> {
        if (this.appContext.withinCordova) {
            this.syncQ.cancelPendingImageSyncs();
        }
        return Promise.resolve(true);
    }
}