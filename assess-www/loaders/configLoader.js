

const networkInterfaces = require('os').networkInterfaces;
const getLocalExternalIp = () => [].concat.apply([], Object.values(networkInterfaces()))
.filter(details => details.family === 'IPv4' && !details.internal)
.pop().address

module.exports = (source) => {
    console.log('Running config loader', );
    return source.replace(/#LOCAL_IP#/, getLocalExternalIp());
};