export enum UploadType {
    BACKGROUND, MANUAL
}

export interface IBatteryUpload {
    isRemove: boolean;
    savedBatteryFileName: string;
    pendingBatteryFileName: string;
    destURL: string;
    batteryId: string;
    opType: UploadType;
}


export interface ISyncState {
    isRemove?: boolean;
    isWaitingForManualComplete?: boolean;
    noneToSync?: boolean;
    errors: any[]
}