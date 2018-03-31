import { INewContentVersion, QueryVersionStatus } from '@assess/content/dto';

export * from './new-content-version';
export * from './content-query-status';

export interface IContentQueryState {
    contentQueryStatus: QueryVersionStatus;
    downloadsNeeded: INewContentVersion[];
    extractedHashes?: any;
}

export interface ITarDownloadState {
    downloadsInError: INewContentVersion[];
    pendingDownloads: INewContentVersion[];
    completedDownloads: INewContentVersion[];
    totalSize: number;
    downloadedSize: number;
    versionsTotal: number;
}

export interface ITarExtractionState {
    completedTarFiles: string[];
    downloadedVersions: INewContentVersion[];
    extractionsWithError: string[];
    extractedHashes: any; 
    pendingTarFiles: string[];
    totalTarFiles: number;     
}