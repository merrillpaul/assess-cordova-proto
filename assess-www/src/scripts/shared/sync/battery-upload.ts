import { CancelTokenSource } from 'axios';

export enum UploadType {
    BACKGROUND, MANUAL
}

export enum ImageSyncStateEnum {
    COMPLETE = 'COMPLETE',
    ERROR = 'ERROR',   
    IMAGE_UPLOADED = 'IMAGE_UPLOADED',
    STARTED = 'STARTED'
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

export interface IImageSyncState {
    totalNumImagesToUpload: number;
    numImagesRemaining: number;
    errors?: any[],
    status: ImageSyncStateEnum
}


export interface ISyncState {
    isRemove?: boolean;
    isWaitingForManualComplete?: boolean;
    noneToSync?: boolean;
    errors: any[];
    needsImages?: boolean;
    imageSyncState?: IImageSyncState;
}

export interface IImageUpload {
    destURL: string;
    batteryId: string;
    subtestGUID: string;
    imageName?: string;
    imageId: string;
    opType: UploadType;
    uploadTracker?: FileTransfer
}