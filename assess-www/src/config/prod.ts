import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = {...BaseConfig,
  centralEndpoint: 'https://www.qiactive.com/choose-share',
};
export default CONFIG;
