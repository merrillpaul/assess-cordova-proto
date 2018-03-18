import { IConfig } from '../scripts/config-type';

export const BaseConfig: IConfig = {
    branch: '#QI_GITHUB_BRANCH#',
    buildHost: "#QI_BUILD_HOST#",
    centralContext: '/choose-share',
    commitDate: "#QI_COMMIT_DATE#",
    commitId: "#QI_COMMIT_ID#",
	config: '#QI_CONF_VERSION#' ,
    configuredVersion: '#QI_CONF_VERSION#'
};

