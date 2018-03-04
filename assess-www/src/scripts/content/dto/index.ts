import { NewContentVersion, QueryVersionStatus } from '@assess/content/dto';

export * from './new-content-version';
export * from './content-query-status';

export interface IContentQueryState {
    contentQueryStatus: QueryVersionStatus;
    downloadsNeeded: NewContentVersion[];
    extractedHashes?: any;
}

export interface ITarDownloadState {
    downloadsInError: NewContentVersion[];
    pendingDownloads: NewContentVersion[];
    completedDownloads: NewContentVersion[];
    totalSize: string;
    downloadedSize: string;
    versionsTotal: number;
}

export interface ITarExtractionState {
    completedTarFiles: string[];
    downloadedVersions: NewContentVersion[];
    extractionsWithError: string[];
    extractedHashes: any; 
    pendingTarFiles: string[];
    totalTarFiles: number;     
}