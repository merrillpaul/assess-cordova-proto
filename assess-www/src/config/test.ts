import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = {...BaseConfig,
  centralEndpoint: 'https://test.qiactive.com/choose-share',
};
export default CONFIG;
