import constants from '../constants';
import { IContentQueryState, ITarDownloadState, NewContentVersion, QueryVersionStatus } from '../dto';

const initialState: IContentQueryState = {
    contentQueryStatus: QueryVersionStatus.NONE,
    downloadsNeeded: []   
};


const queryContent = (state: IContentQueryState = initialState, action: any): IContentQueryState => {
    let newState: IContentQueryState;
    switch(action.type) {  

        case constants.GET_HASHES_REJECTED:
            newState = { ...state, contentQueryStatus: QueryVersionStatus.FAILED_HASHES };
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
    downloadedSize: '',
    pendingDownloads: [],    
    totalSize: '',
    versionsTotal: 0
}


const tarsDownloaded = (state: ITarDownloadState = tarsDownloadedInitialState, action: any): ITarDownloadState => {
    let newState: ITarDownloadState;
    switch(action.type) {

        case constants.CONTENT_DOWNLOAD_TAR_SAGA_START:
            const downloadsNeeded: NewContentVersion[]  = action.contentQueryResult.downloadsNeeded;
            newState = {...tarsDownloadedInitialState, completedDownloads: [], pendingDownloads: downloadsNeeded, 
                downloadedSize: '0KB', totalSize: action.totalSizeInText, versionsTotal: downloadsNeeded.length};
            break;
        case constants.CONTENT_DOWNLOAD_TAR_FINISHED:
            const version = action.currentVersion;
            const completedDownloads = state.completedDownloads.map (it => it);
            completedDownloads.push(version);
            const pendingDownloads = state.pendingDownloads.filter (it => it !== version);
            newState = {...state, downloadedSize: action.downloadedSize, completedDownloads, pendingDownloads };
            break;
        default:
            newState = state;
            break;
    }
    return newState;
};

export default {
    queryContent, tarsDownloaded
};