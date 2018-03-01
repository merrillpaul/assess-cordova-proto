import constants from '@assess/content/constants';

/*
    action creators
*/
export const startContentDownload = () => {
    return {
        type: constants.CONTENT_DOWNLOAD_SAGA_STARTED
    };
};