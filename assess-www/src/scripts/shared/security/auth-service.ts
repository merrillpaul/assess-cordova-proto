import { Inject, Service } from 'typedi';

import { HttpService } from '@assess/shared/http/http-service';

@Service()
export class AuthService {

  @Inject()
  private httpService: HttpService;

  public login(username: string, password: string): Promise<any> {
    return this.httpService.getCentralRequest()
      .get('/sync/checkAuth', { auth: { password, username }, timeout: 1000 * 30 });
  }
}


