

const networkInterfaces = require('os').networkInterfaces;
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
.filter(details => details.family === 'IPv4' && !details.internal)
.pop().address


const getBranch = () =>  process.env.QI_BRANCH || "master";
const getConfigName = () =>  process.env.QI_CONFIG_NAME || "dev";



module.exports = (source) => {
    console.log('Running config loader', );
    source = source.replace(/#LOCAL_IP#/, getLocalExternalIp());
    source = source.replace(/#QI_GITHUB_BRANCH#/, getBranch());
    source = source.replace(/#CONFIG_NAME#/, getConfigName());
    return source;
};

