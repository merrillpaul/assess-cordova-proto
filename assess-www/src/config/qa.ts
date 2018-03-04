import { IConfig } from '../scripts/config-type';
import { BaseConfig } from './base-config';
const CONFIG: IConfig = {...BaseConfig,
  centralEndpoint: 'https://qa.qiactive.com'
};
export default CONFIG; 