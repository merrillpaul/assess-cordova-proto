import { CancelTokenSource } from 'axios';

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
    cancelToken?: CancelTokenSource
}


export interface ISyncState {
    isRemove?: boolean;
    isWaitingForManualComplete?: boolean;
    noneToSync?: boolean;
    errors: any[]
}

export interface IImageUpload {
    destURL: string;
    batteryId: string;
    subtestGUID: string;
    imageName?: string;
    imageId: string;
    opType: UploadType;
    cancelToken?: CancelTokenSource
}