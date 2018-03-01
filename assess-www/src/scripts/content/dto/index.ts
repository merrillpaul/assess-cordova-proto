import { NewContentVersion, QueryVersionStatus } from '@assess/content/dto';

export * from './new-content-version';
export * from './content-query-status';

export interface IContentQueryState {
    contentQueryStatus: QueryVersionStatus;
    downloadsNeeded: NewContentVersion[];
    extractedHashes?: any
}