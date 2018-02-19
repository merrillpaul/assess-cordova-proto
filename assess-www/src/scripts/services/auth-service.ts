import axios from 'axios';
import { AxiosInstance } from 'axios';

import config from '@appEnvironment';

class AuthService {
  private request: AxiosInstance;
  constructor() {
    this.request = axios.create({
      baseURL: config.centralEndpoint,
      headers: {
        'X-Requested-With': 'Assess-App',
      },
    });
  }
}

export default new AuthService();
