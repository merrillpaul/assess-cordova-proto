import constants from '../constants';
import { IContentQueryState, QueryVersionStatus } from '../dto';

const initialState: IContentQueryState = {
    contentQueryStatus: QueryVersionStatus.NONE,
    downloadsNeeded: []   
};


const queryContent = (state: IContentQueryState = initialState, action: any): IContentQueryState => {
    let newState: any;
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

        case constants.CONTENT_DOWNLOAD_STARTED:    
            newState = {...initialState, contentQueryStatus: QueryVersionStatus.STARTED};
            break;
        default:
            newState = state;
            break;
    }
    return newState;
};

export default {
    queryContent
};