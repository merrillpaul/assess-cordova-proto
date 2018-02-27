import { Config } from '../scripts/config-type';
import { BaseConfig } from './base-config';

const CONFIG: Config = { ...BaseConfig,
  centralEndpoint: 'http://#LOCAL_IP#:8080/choose-share',
};

export default CONFIG;
