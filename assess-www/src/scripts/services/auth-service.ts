

import config from '@appEnvironment';

import { Inject, Service } from 'typedi';

import { HttpService } from '@assess/shared/http/http-service';

@Service()
export class AuthService {

  @Inject()
  private httpService: HttpService;

  public login(username: string, password: string): Promise<any> {
    return this.httpService.getRequest().get('https://randomuser.me/api/');
  }
}


