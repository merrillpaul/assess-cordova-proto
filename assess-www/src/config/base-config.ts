import { IConfig } from '../scripts/config-type';

export const BaseConfig: IConfig = {
    branch: `${process.env.QI_GITHUB_BRANCH}`,
    buildHost: `${process.env.QI_BUILD_HOST}`,
    centralContext: '/choose-share',
    commitDate: `${process.env.QI_COMMIT_DATE}`,
    commitId: `${process.env.QI_COMMIT_ID}`,
	config: `${process.env.QI_CONF_VERSION}` ,
    configuredVersion: `${process.env.QI_CONF_VERSION}`
};

