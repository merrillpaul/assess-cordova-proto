import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = {...BaseConfig,
  centralContext: '/choose-share',
  centralEndpoint: 'https://www.qiactive.com'
};
export default CONFIG;
