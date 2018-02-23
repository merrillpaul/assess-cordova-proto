
import { AxiosInstance, default as axios } from 'axios';

import config from '@appEnvironment';
import { Service } from 'typedi';

const HEADERS:any = {
    'X-Requested-With': 'Assess',
};

@Service()
export class HttpService {
    private centralRequest: AxiosInstance;

    constructor() {
        this.centralRequest = axios.create({
          baseURL: config.centralEndpoint,
          headers: HEADERS
        });
    }

    public getCentralRequest(): AxiosInstance {
        return this.centralRequest;
    }

    public getRequest(): AxiosInstance {
        return axios.create({headers: HEADERS});
    }
}
