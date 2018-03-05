import constants from '../constants';
import { IContentQueryState, ITarDownloadState, ITarExtractionState,
    NewContentVersion, QueryVersionStatus } from '../dto';

const initialState: IContentQueryState = {
    contentQueryStatus: QueryVersionStatus.NONE,
    downloadsNeeded: [],
    extractedHashes: {}
};


const queryContent = (state: IContentQueryState = initialState, action: any): IContentQueryState => {
    let newState: IContentQueryState;
    switch(action.type) {  

        case constants.GET_HASHES_REJECTED:
            newState = { ...state, contentQueryStatus: QueryVersionStatus.FAILED_HASHES };
            break;

        case constants.GET_HASHES_FULFILLED:
            newState = {...state, extractedHashes: JSON.parse(action.payload)}
            break;
        case constants.QUERY_VERSION_REJECTED:
            newState = { ...state, contentQueryStatus: action.error || QueryVersionStatus.FAILED };
            break;

        case constants.QUERY_VERSION_FULFILLED:
            newState = {...state, ...action.queryVersionResult};
            break;

        case constants.CONTENT_DOWNLOAD_SAGA_STARTED:    
            newState = {...initialState, contentQueryStatus: QueryVersionStatus.STARTED};
            break;

        case constants.CONTENT_DOWNLOAD_TAR_SAGA_FINISHED:
            newState = {...state, downloadsNeeded: []}
            // cleanup to reclaim memory
            break;    
        default:
            newState = state;
            break;
    }
    return newState;
};


const tarsDownloadedInitialState: ITarDownloadState = {
    completedDownloads: [],
    downloadedSize: 0,
    downloadsInError: [],
    pendingDownloads: [],    
    totalSize: 0,
    versionsTotal: 0
}

const calculateDownloadSize =(downloadState: ITarDownloadState): number => {
        let total = 0;
        total = downloadState.pendingDownloads.length > 0 ? 
            downloadState.pendingDownloads.map(it => it.downloadedSize || 0).reduce((prev, el) => prev + el) : 0;
        total += downloadState.completedDownloads.length > 0 ? 
            downloadState.completedDownloads.map(it => it.downloadedSize || 0).reduce((prev, el) => prev + el) : 0;
        total -=  downloadState.downloadsInError.length > 0 ? 
            downloadState.downloadsInError.map(it => it.downloadedSize || 0).reduce((prev, el) => prev + el) : 0;
        return total;
};


const tarsDownloaded = (state: ITarDownloadState = tarsDownloadedInitialState, action: any): ITarDownloadState => {
    let newState: ITarDownloadState;
    let version: NewContentVersion;
    let completedDownloads: NewContentVersion[];
    let pendingDownloads: NewContentVersion[];
    switch(action.type) {

        case constants.CONTENT_DOWNLOAD_TAR_SAGA_START:
            const downloadsNeeded: NewContentVersion[]  = action.contentQueryResult.downloadsNeeded;
            newState = {...tarsDownloadedInitialState, completedDownloads: [], downloadedSize: 0, pendingDownloads: downloadsNeeded, 
                totalSize: action.totalSizeInBytes, versionsTotal: downloadsNeeded.length};
            break;
        case constants.CONTENT_DOWNLOAD_TAR_FINISHED:
            version = {...action.currentVersion, downloadedSize: action.currentVersion.size};
            completedDownloads = state.completedDownloads.map (it => it);
            completedDownloads.push(version);
            pendingDownloads = state.pendingDownloads.filter (it => it.versionWithType !== version.versionWithType);
            newState = {...state, completedDownloads, pendingDownloads };
            newState.downloadedSize = calculateDownloadSize(newState);
            break;

        case constants.CONTENT_DOWNLOAD_TAR_PROGRESS:
            version = {...action.currentVersion, downloadedSize: action.downloadedSize};
            pendingDownloads = state.pendingDownloads.map (it => { 
                return it.versionWithType ===  version.versionWithType ? version : it;
            });
            
            newState = {...state, pendingDownloads };
            newState.downloadedSize = calculateDownloadSize(newState);
            break;

        case constants.CONTENT_DOWNLOAD_TAR_REJECTED:
            version = {...action.currentVersion};
            const downloadsInError = state.downloadsInError.map (it => it);
            downloadsInError.push(version);
            pendingDownloads = state.pendingDownloads.filter (it => it.versionWithType !== version.versionWithType);
            newState = {...state, downloadsInError, pendingDownloads };
            newState.downloadedSize = calculateDownloadSize(newState);
            break;
        default:
            newState = state;
            break;
    }
    return newState;
};

const tarsExtractionInitialState: ITarExtractionState = {
    completedTarFiles: [],
    downloadedVersions: [],
    extractedHashes: {},
    extractionsWithError: [],
    pendingTarFiles: [],
    totalTarFiles: 0
};

const tarsExtracted = (state: ITarExtractionState = tarsExtractionInitialState, action: any): ITarExtractionState => {
    let newState: ITarExtractionState;
    let currentTar: string;
    let currentTarVersion:NewContentVersion;
    let completedTarFiles: string[];
    let pendingTarFiles: string[];
    let extractedHashes: any;

    switch(action.type) {
        case constants.CONTENT_EXTRACT_SAGA_TAR_STARTED:
            newState = {...state, downloadedVersions: action.downloadedVersions, extractedHashes: action.extractedHashes };
            break;
        
        case constants.CONTENT_EXTRACT_TAR_LIST_FULFILLED:
            newState = {...state, pendingTarFiles: action.tarsToExtract, totalTarFiles: action.tarsToExtract.length};
            break;

        case constants.CONTENT_EXTRACT_TAR_FINISHED:
            currentTar = action.currentTar;
            currentTarVersion = state.downloadedVersions.filter(it => it.versionWithType === currentTar.split('.tar')[0])[0];
            completedTarFiles = state.completedTarFiles.map (it => it);
            completedTarFiles.push(currentTar);
            pendingTarFiles = state.pendingTarFiles.filter (it => it !== currentTar);
            extractedHashes = state.extractedHashes;
            if (currentTarVersion) {
                extractedHashes[currentTarVersion.versionWithType] = currentTarVersion.hash;
            }
            newState = {...state, completedTarFiles, extractedHashes, pendingTarFiles };
            break;

        case constants.CONTENT_EXTRACT_TAR_REJECTED:
            currentTar = action.currentTar;
            currentTarVersion = state.downloadedVersions.filter(it => it.versionWithType === currentTar.split('.tar')[0])[0];
            const extractionsWithError = state.extractionsWithError.map (it => it);
            extractionsWithError.push(currentTar);
            pendingTarFiles = state.pendingTarFiles.filter (it => it !== currentTar);            
            newState = {...state, extractionsWithError, pendingTarFiles };
            break;
        default:
            newState = state;
    }
    return newState;
}

export default {
    queryContent, tarsDownloaded, tarsExtracted
};