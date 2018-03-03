import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = {...BaseConfig,
  centralContext: '/choose-share',
  centralEndpoint: 'http://dev.qiactive.com'
};
export default CONFIG;
