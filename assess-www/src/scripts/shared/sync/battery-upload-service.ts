import { BatteryService } from '@assess/shared/battery/battery-service';
import { BatteryStatusDAO } from '@assess/shared/battery/battery-status-dao';
import { ConfigService } from '@assess/shared/config/config-service';
import { FileService } from '@assess/shared/file/file-service';
import { HttpService } from '@assess/shared/http/http-service';
import { Logger } from '@assess/shared/log/logger-annotation';
import { LoggingService } from '@assess/shared/log/logging-service';
import { UserStoreService } from '@assess/shared/security/user-store-service';
import { IBatteryUpload, UploadType } from '@assess/shared/sync/battery-upload';
import { default as axios } from 'axios';
import * as qs from 'qs';
import { Inject, Service } from 'typedi';
import { v4 } from 'uuid';

const SHARE_SYNC_URL = '/sync/syncBatteryData';
const RETURN_CONTROL_TO_SHARE_URL ='/sync/returnControlToShare';

@Service()
export class BatteryUploadService {

    @Inject()
    private userStore: UserStoreService;

    @Inject()
    private fileService: FileService;

    @Inject()
    private httpService: HttpService;

    @Inject()
    private configService: ConfigService;

    @Inject()
    private batteryStatusDao: BatteryStatusDAO;

    @Inject()
    private batteryService: BatteryService;

    @Logger()
    private logger: LoggingService;

    public opToSyncBattery(batteryId: string,  isBackgroundSync:boolean): Promise<IBatteryUpload> {
        this.logger.debug(`operation to sync battery ${batteryId} and is BG ${isBackgroundSync}`); 
        return this.prepBasicOperationForBattery(batteryId, SHARE_SYNC_URL)
        .then(batteryUpload => {
                this.logger.debug(`Battery upload for ${JSON.stringify(batteryUpload)}`);
                batteryUpload.opType = isBackgroundSync ? UploadType.BACKGROUND : UploadType.MANUAL;
                return batteryUpload;
        }); 
    }

    public opToSyncBatteryInForeground(batteryId: string,  isRemove:boolean): Promise<IBatteryUpload> {
        this.logger.debug(`operation to sync battery in the fg ${batteryId} and is remove ${isRemove}`); 

        return this.prepBasicOperationForBattery(batteryId, isRemove? RETURN_CONTROL_TO_SHARE_URL: SHARE_SYNC_URL)
        .then(batteryUpload => {
                this.logger.debug(`Battery upload for ${JSON.stringify(batteryUpload)}`);
                batteryUpload.isRemove = isRemove;
                batteryUpload.opType = UploadType.MANUAL;
                return batteryUpload;
        }); 
    }

    public runSyncOperation(task: any): Promise<boolean> {
        const battery: IBatteryUpload = task.battery;
        const batteryId = task.batteryId;

        this.logger.debug(`Running sync operation for ${battery.batteryId}`);
        return this.userStore.getUserPendingBatteryDir()
        .then(dir => this.fileService.readAsText(dir, battery.pendingBatteryFileName))
        .then(json => this.uploadBatteryJson(battery, json));
    }


    public uploadBatteryJson(battery: IBatteryUpload, json: string) : Promise<boolean> {
        this.logger.debug(`Uploading json to Central for ${battery.batteryId} from ${battery.pendingBatteryFileName}`);
        const cancelToken = axios.CancelToken.source();
        battery.cancelToken = cancelToken;
        this.logger.debug(`Getting cancellation token for ${battery.destURL} with ${cancelToken.token}`);
        const bodyFormData: any = {};
        bodyFormData.json = json;     
        return this.httpService.post(battery.destURL, qs.stringify(bodyFormData), {timeout: 1000 * 120, cancelToken: cancelToken.token })
        .then(response => {
            this.logger.success(`Successful sync with result ${JSON.stringify(response.data)} for ${battery.batteryId}`);
            return this.onUploadSucceeded(battery);
        })
        .catch(error => {
            
            if (axios.isCancel(error)) {
                this.logger.warn(`Request was cancelled for ${battery.batteryId}`);
                return true;
            }
            this.logger.error(`Error syncing data ${JSON.stringify(error)}`);
            this.batteryStatusDao.setActiveBattery(null)
            .then(() => { throw error;});
        });
    }


    public updatePendingCopyIfPossible(battery: IBatteryUpload): Promise<boolean> {
        return this.userStore.getUserSavedBatteryDir()
        .then(savedDir => this.fileService.getFile(savedDir, battery.savedBatteryFileName))
        .then(savedBatteryJson => Promise.all([savedBatteryJson, this.userStore.getUserPendingBatteryDir()]))
        .then(results => {
            const batteryJson = results[0];
            const pendingDir = results[1];
            return new Promise<boolean>((res, rej) => {
                this.logger.debug(`Copying ${batteryJson.nativeURL} to ${pendingDir.toInternalURL()}/${battery.pendingBatteryFileName}`);
                batteryJson.copyTo(pendingDir, battery.pendingBatteryFileName, () => res(), e => rej(e));
            });
        });
    }

    public deleteFileAtPendingPath(fileName: string): Promise<boolean> {
        this.logger.debug(`deleting pending file for ${fileName}`);
        return this.userStore.getUserPendingBatteryDir()
        .then(dir => this.fileService.deleteFileSilently(dir, fileName));
    }

    private prepBasicOperationForBattery(batteryId: string, url: string): Promise<IBatteryUpload> {
        const battery: IBatteryUpload = {
            batteryId,
            destURL: url,
            isRemove: false,
            opType: UploadType.BACKGROUND,
            pendingBatteryFileName: this.getDestinationPathName(batteryId),
            savedBatteryFileName: `${batteryId}.json`
        };

        return this.updatePendingCopyIfPossible(battery)
        .then(() => battery);
    }

    private getDestinationPathName(batteryId: string): string {
        return `${Date.now()}_${v4()}_${batteryId}.json`;
    }

    private onUploadSucceeded(battery: IBatteryUpload): Promise<boolean> {
        return this.batteryStatusDao.setActiveBattery(null)
        .then(() => this.userStore.getUserPendingBatteryDir())
        .then(pendingDir => this.fileService.deleteFileSilently(pendingDir, battery.pendingBatteryFileName))
        .then(() => {
            if (battery.isRemove) {
                return this.batteryService.deleteAudioFilesForBatteryId(battery.batteryId)
                .then(() => this.userStore.getUserSavedBatteryDir())
                .then(savedDir => this.fileService.deleteFileSilently(savedDir, battery.savedBatteryFileName))
                .then(() => this.batteryStatusDao.removeBatteryFromRepoWithId(battery.batteryId))

            } else {
                return true;
            }
        })
        .then(() => true );
    }
}