export interface INewContentVersion {
    versionWithType: string;
    displayName: string;
    hash: string;
    url: string;
    size: number;
    path: string;
    downloadedSize?: number;
}