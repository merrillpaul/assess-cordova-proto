import keyMirror = require('keymirror');

export default keyMirror({    
    CONTENT_DOWNLOAD_SAGA_FINISHED: null,
    CONTENT_DOWNLOAD_SAGA_STARTED: null,    
    CONTENT_DOWNLOAD_TAR_FINISHED: null, 
    CONTENT_DOWNLOAD_TAR_REJECTED: null, 
    CONTENT_DOWNLOAD_TAR_SAGA_FINISHED: null,
    CONTENT_DOWNLOAD_TAR_SAGA_START: null, 
    CONTENT_DOWNLOAD_TAR_SAGA_STARTED: null, 
    CONTENT_DOWNLOAD_TAR_STARTED: null,         
    CONTENT_EXTRACT_SAGA_TAR_FINISHED: null,   
    CONTENT_EXTRACT_SAGA_TAR_REJECTED: null,
    CONTENT_EXTRACT_SAGA_TAR_STARTED: null,   
    CONTENT_EXTRACT_TAR_FINISHED: null,  
    CONTENT_EXTRACT_TAR_LIST_FULFILLED: null,       
    CONTENT_EXTRACT_TAR_REJECTED: null,
    CONTENT_EXTRACT_TAR_STARTED: null,       
    GET_HASHES: null,
    GET_HASHES_FULFILLED: null,  
    GET_HASHES_PENDING: null,
    GET_HASHES_REJECTED: null,
    QUERY_VERSION_COMPLETED: null,
    QUERY_VERSION_FULFILLED: null,
    QUERY_VERSION_PENDING: null,
    QUERY_VERSION_REJECTED: null,
    WRITE_HASHES: null
});
