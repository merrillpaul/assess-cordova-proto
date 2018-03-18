

const networkInterfaces = require('os').networkInterfaces;
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
.filter(details => details.family === 'IPv4' && !details.internal)
.pop().address


const getBranch = () =>  process.env.QI_BRANCH || "master";
const getConfigName = () =>  process.env.QI_CONFIG_NAME || "dev";
const getCommitDate = () =>  process.env.QI_COMMIT_DATE || "today";
const getCommitId = () =>  process.env.QI_COMMIT_ID || "12345";
const getBuildHost = () =>  process.env.QI_BUILD_HOST || "localmachine";
const getConfiguredVersion = () =>  process.env.QI_CONF_VERSION || "dev";


module.exports = (source) => {
    source = source.replace(/#LOCAL_IP#/, getLocalExternalIp());
    source = source.replace(/#QI_GITHUB_BRANCH#/, getBranch());
    source = source.replace(/#CONFIG_NAME#/, getConfigName());
    source = source.replace(/#QI_BUILD_HOST#/, getBuildHost());
    source = source.replace(/#QI_COMMIT_DATE#/, getCommitDate());
    source = source.replace(/#QI_COMMIT_ID#/, getCommitId());
    source = source.replace(/#QI_CONF_VERSION#/, getConfiguredVersion());
    return source;
};

