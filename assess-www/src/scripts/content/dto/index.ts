import { NewContentVersion, QueryVersionStatus } from '@assess/content/dto';

export * from './new-content-version';
export * from './content-query-status';

export interface IContentQueryState {
    contentQueryStatus: QueryVersionStatus;
    downloadsNeeded: NewContentVersion[];
    extractedHashes?: any;
}

export interface ITarDownloadState {
    pendingDownloads: NewContentVersion[];
    completedDownloads: NewContentVersion[];
    totalSize: string;
    downloadedSize: string;
    versionsTotal: number;
}