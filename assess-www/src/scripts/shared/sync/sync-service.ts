import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { ISyncState } from '@assess/shared/sync/battery-upload';
import { SyncOperationQ } from '@assess/shared/sync/sync-operation-q';
import { Observable, Subject } from "rxjs";
import { Inject, Service } from 'typedi';

@Service()
export class SyncService {

    @Inject()
    private syncQ: SyncOperationQ;

    @Logger()
    private logger: LoggingService;

    public syncSubtestDataToShare(): Observable<ISyncState> {

        // TODO all those offline checks
        this.logger.debug('Running syncSubtestDataToShare');
        return this.syncQ.performManualSync();        
    }

    public getLastSuccessfulSyncDateString(): Promise<string> {
        return Promise.resolve('02-Jan-2018 22:22:30');
    }

    public queueBatteryForSync(batteryId: string) : Promise<boolean> {
        return Promise.resolve(true);
    }

    public queueUpdateIndicator(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public cancelUploadAssessmentImages(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public uploadAssessmentImagesToChooseShare(): Promise<boolean> {
        return Promise.resolve(true);
    }

    public transferSingleBatteryDataToShareAndRemove(batteryId: string): Promise<boolean> {
        return Promise.resolve(true);
    }
}